import { Injectable, computed, signal } from '@angular/core';
import { Customer, ID, Invoice, InvoiceItem, Payment, Unit } from './models';
import { addMonths, endOfMonth, format, isAfter } from 'date-fns';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface BillingDB extends DBSchema {
  customers: { key: string; value: Customer };
  units: { key: string; value: Unit };
  invoices: { key: string; value: Invoice };
  payments: { key: string; value: Payment };
}

export interface InvoiceWithCustomer extends Invoice {
  customer: Customer | null;
}

function uid(prefix = ''): ID { return prefix + Math.random().toString(36).slice(2, 9); }
function iso(d = new Date()) { return new Date(d).toISOString(); }

@Injectable({ providedIn: 'root' })
export class MockApiService {
  private db!: IDBPDatabase<BillingDB>;

  customers = signal<Customer[]>([]);
  units = signal<Unit[]>([]);
  invoices = signal<Invoice[]>([]);
  payments = signal<Payment[]>([]);

  totalDue = computed(() => this.invoices().filter(i => i.status === 'issued' || i.status === 'overdue')
    .reduce((sum, i) => sum + (i.total - i.paidAmount), 0));

  totalPaidThisMonth = computed(() => {
    const ym = format(new Date(), 'yyyy-MM');
    return this.payments().filter(p => p.date.startsWith(ym)).reduce((s, p) => s + p.amount, 0);
  });

    // Computed invoice data with customer attached
 invoicesWithCustomer = computed<InvoiceWithCustomer[]>(() => {
  const custMap = new Map(this.customers().map(c => [c.id, c]));
  return this.invoices().map(i => ({
    ...i,
    customer: custMap.get(i.customerId!) ?? null // assert i.customerId exists
  }));
});

  // Similarly for units
  unitsWithCustomer = computed(() => {
  const custMap = new Map(this.customers().map(c => [c.id, c]));
  return this.units().map(u => ({
        ...u,
        customer: u.customerId ? custMap.get(u.customerId) || null : null
    }));
  });

  paymentsWithInvoice = computed(() => {
    const invoiceMap = new Map(this.invoices().map(inv => [inv.id, inv]));
    const custMap = new Map(this.customers().map(c => [c.id, c]));
    return this.payments().map(p => {
        const invoice = invoiceMap.get(p.invoiceId) || null;
        const customer = invoice ? custMap.get(invoice.customerId) || null : null;
        return { ...p, invoice, customer };
    });
  });

  constructor() {
    this.initDB();
  }

  private async initDB() {
    this.db = await openDB<BillingDB>('billing-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('customers')) db.createObjectStore('customers', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('units')) db.createObjectStore('units', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('invoices')) db.createObjectStore('invoices', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('payments')) db.createObjectStore('payments', { keyPath: 'id' });
      }
    });

    // Load existing data into signals
    const [customers, units, invoices, payments] = await Promise.all([
      this.db.getAll('customers'), this.db.getAll('units'), this.db.getAll('invoices'), this.db.getAll('payments')
    ]);
    this.customers.set(customers);
    this.units.set(units);
    this.invoices.set(invoices);
    this.payments.set(payments);
  }

  // ===== Customers =====
  async upsertCustomer(c: Partial<Customer> & { name: string }) {
    const now = iso();
    if (!c.id) {
      const created: Customer = { id: uid('c_'), name: c.name, email: c.email, phone: c.phone, isActive: c.isActive ?? true, createdAt: now, updatedAt: now };
      await this.db.put('customers', created);
      this.customers.update(list => [created, ...list]);
    } else {
      const updated: Customer = { ...c, updatedAt: now } as Customer;
      await this.db.put('customers', updated);
      this.customers.update(list => list.map(x => x.id === c.id ? updated : x));
    }
  }

  async deleteCustomer(id: ID) {
    await this.db.delete('customers', id);
    this.customers.update(list => list.filter(x => x.id !== id));
  }

  // ===== Units =====
  async upsertUnit(u: Partial<Unit> & { code: string; baseFee: number }) {
    const now = iso();
    if (!u.id) {
      const created: Unit = { id: uid('u_'), code: u.code, baseFee: u.baseFee, customerId: u.customerId, isActive: u.isActive ?? true, createdAt: now, updatedAt: now };
      await this.db.put('units', created);
      this.units.update(list => [created, ...list]);
    } else {
      const updated: Unit = { ...u, updatedAt: now } as Unit;
      await this.db.put('units', updated);
      this.units.update(list => list.map(x => x.id === u.id ? updated : x));
    }
  }

  async deleteUnit(id: ID) {
    await this.db.delete('units', id);
    this.units.update(list => list.filter(x => x.id !== id));
  }

  // ===== Invoices =====
  makeInvoiceForUnit(unit: Unit, period: string): Invoice {
    const customerId = unit.customerId!;
    const issueDate = new Date(period + '-01T00:00:00');
    const dueDate = endOfMonth(issueDate);
    const items: InvoiceItem[] = [
      { description: `Monthly Base Fee (${unit.code})`, qty: 1, unitPrice: unit.baseFee, total: unit.baseFee }
    ];
    const subtotal = items.reduce((s, it) => s + it.total, 0);
    const tax = 0;
    const total = subtotal + tax;
    const now = iso();
    return {
      id: uid('inv_'), unitId: unit.id, customerId, period,
      issueDate: issueDate.toISOString(), dueDate: dueDate.toISOString(),
      items, subtotal, tax, total, paidAmount: 0, status: 'issued', createdAt: now, updatedAt: now
    };
  }

  async generateMonthly(period: string) {
    const activeUnits = this.units().filter(u => u.isActive && u.customerId);
    let created = 0, skipped = 0;
    const existingKey = new Set(this.invoices().map(i => `${i.unitId}-${i.period}`));
    for (const u of activeUnits) {
      const key = `${u.id}-${period}`;
      if (existingKey.has(key)) { skipped++; continue; }
      const invoice = this.makeInvoiceForUnit(u, period);
      await this.db.put('invoices', invoice);
      this.invoices.update(list => [invoice, ...list]);
      created++;
    }
    return { created, skipped };
  }

  async recordPayment(invoiceId: ID, amount: number, method: Payment['method'], reference?: string) {
    const now = iso();
    const p: Payment = { id: uid('pay_'), invoiceId, amount, method, reference, date: now, createdAt: now };
    await this.db.put('payments', p);
    this.payments.update(list => [p, ...list]);

    const invoice = this.invoices().find(inv => inv.id === invoiceId)!;
    const paidAmount = invoice.paidAmount + amount;
    const status: Invoice['status'] = paidAmount >= invoice.total ? 'paid' : (isAfter(new Date(), new Date(invoice.dueDate)) ? 'overdue' : 'issued');
    const updatedInvoice = { ...invoice, paidAmount, status, updatedAt: now };
    await this.db.put('invoices', updatedInvoice);
    this.invoices.update(list => list.map(i => i.id === invoiceId ? updatedInvoice : i));
  }

  async voidInvoice(id: ID) {
        const now = iso();
        const invoice = this.invoices().find(i => i.id === id)!;

        // Explicitly type status as Invoice['status']
        const updatedInvoice: Invoice = { 
            ...invoice, 
            status: 'void' as Invoice['status'], 
            updatedAt: now 
        };

        await this.db.put('invoices', updatedInvoice);
        this.invoices.update(list => list.map(i => i.id === id ? updatedInvoice : i));
    }

    

    
}
