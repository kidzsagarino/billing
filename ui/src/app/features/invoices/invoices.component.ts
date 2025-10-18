import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';

interface Invoice {
  date: string;
  description: string;
  total: number;
  status: string;
}

interface MonthlySummary {
  tenantName: string;
  month: string;
  totalInvoices: number;
  totalAmount: number;
  invoices: Invoice[];
}

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf]
})
export class InvoicesComponent {
  expandedTenant: string | null = null;
  expandedMonth: string | null = null;

  summary: MonthlySummary[] = [
    {
      tenantName: 'John Doe',
      month: '2025-01',
      totalInvoices: 2,
      totalAmount: 2820.35,
      invoices: [
        { date: '2025-01-05', description: 'Condo Due', total: 2000, status: 'Paid' },
        { date: '2025-01-10', description: 'Water Bill', total: 820.35, status: 'Paid' },
      ]
    },
    {
      tenantName: 'Jane Smith',
      month: '2025-01',
      totalInvoices: 2,
      totalAmount: 2807.90,
      invoices: [
        { date: '2025-01-05', description: 'Condo Due', total: 2000, status: 'Paid' },
        { date: '2025-01-10', description: 'Water Bill', total: 807.90, status: 'Paid' },
      ]
    },
    {
      tenantName: 'Alice Johnson',
      month: '2025-01',
      totalInvoices: 2,
      totalAmount: 443.70,
      invoices: [
        { date: '2025-01-05', description: 'Condo Due', total: 2000, status: 'Overdue' },
        { date: '2025-01-10', description: 'Water Bill', total: 443.70, status: 'Paid' },
      ]
    }
  ];

  toggleTenant(tenant: string) {
    this.expandedTenant = this.expandedTenant === tenant ? null : tenant;
    this.expandedMonth = null;
  }

  toggleMonth(month: string) {
    this.expandedMonth = this.expandedMonth === month ? null : month;
  }
}
