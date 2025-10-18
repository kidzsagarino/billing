export type ID = string;


export interface Customer {
id: ID;
name: string;
email?: string;
phone?: string;
isActive: boolean;
createdAt: string; // ISO
updatedAt: string; // ISO
}


export interface Unit {
id: ID;
code: string; // e.g., A-101
customerId?: ID; // optional assignment
baseFee: number; // monthly base fee
isActive: boolean;
createdAt: string;
updatedAt: string;
}


export interface InvoiceItem {
description: string;
qty: number;
unitPrice: number;
total: number; // qty * unitPrice
}


export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'void';


export interface Invoice {
id: ID;
unitId: ID;
customerId: ID;
period: string; // YYYY-MM
issueDate: string; // ISO
dueDate: string; // ISO
items: InvoiceItem[];
subtotal: number;
tax: number;
total: number;
paidAmount: number;
status: InvoiceStatus;
createdAt: string;
updatedAt: string;
}


export interface Payment {
id: ID;
invoiceId: ID;
amount: number;
method: 'cash' | 'bank' | 'gcash' | 'card' | 'other';
reference?: string;
date: string; // ISO
createdAt: string;
}