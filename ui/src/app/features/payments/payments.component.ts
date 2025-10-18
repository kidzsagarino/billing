import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent {
  displayedColumns: string[] = ['date', 'tenant', 'amount', 'method', 'status'];

  payments = [
    { date: '2025-01-05', tenant: 'John Doe', amount: 1200, method: 'Cash', status: 'Paid' },
    { date: '2025-01-10', tenant: 'Jane Smith', amount: 1500, method: 'Bank Transfer', status: 'Paid' },
    { date: '2025-01-15', tenant: 'Mark Lee', amount: 1000, method: 'GCash', status: 'Pending' },
    { date: '2025-02-05', tenant: 'John Doe', amount: 1200, method: 'Cash', status: 'Paid' },
    { date: '2025-02-12', tenant: 'Jane Smith', amount: 1500, method: 'Bank Transfer', status: 'Paid' },
    { date: '2025-02-20', tenant: 'Mark Lee', amount: 1000, method: 'GCash', status: 'Paid' }
  ];
}