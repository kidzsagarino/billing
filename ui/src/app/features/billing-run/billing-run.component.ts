
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { Component, OnInit } from '@angular/core';
import { BillingService } from '../../services/billing.service';

import { BillingRecord } from '../../models/billing.model';

export interface Billing {
  FullName: string;
  UnitNumber: string;
  BillingMonth: string;
  DueDate: string;
  CondoDues: number;
  WaterBill: number;
  OverdueAmount: number;
  Penalty: number;
  TotalAmount: number;
  PaidAmount: number;
  Balance: number;
  Status: 'Unpaid' | 'Paid' | 'PartiallyPaid' | 'Overdue';
}

@Component({
  selector: 'app-billing-run',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule
  ],
  templateUrl: './billing-run.component.html',
  styleUrls: ['./billing-run.component.css']
})
export class BillingRunComponent {
  billings: Billing[] = [];
  billingMonth: string = '2025-10'; // default month (can be changed by UI)
  loading = false;

    // Dropdown selections
  selectedYear: number = 2025;
  selectedMonth: number = 10;

  // Year and month arrays for dropdowns
  years: number[] = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i); // last 5 years
  months: number[] = Array.from({ length: 12 }, (_, i) => i + 1);

  constructor(private billingService: BillingService) {}

  ngOnInit() {
    this.loadBilling();
  }

  get billingMonthString(): string {
    return `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, '0')}`;
  }

  loadBilling() {
    this.loading = true;

    // Format YYYY-MM
    const monthStr = this.selectedMonth.toString().padStart(2, '0');
    const billingMonth = `${this.selectedYear}-${monthStr}`;

    this.billingService.getBillingByMonth(billingMonth).subscribe({
      next: (data: any) => {
        
        if(data.status == 0){
          console.log('No records found');
        }
        else{
          this.billings = data.data;
        }
        // Apply optional search filters
       
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load billing:', err);
        this.loading = false;
      }
    });
  }
  generateBilling(): void {
    this.loading = true;
    this.billingService.generateBilling(this.billingMonthString).subscribe({
      next: (res: any) => {
        console.log(res.message); // e.g., "Billing for 2025-10 generated."
        // Reload table after generation
        this.loadBilling();
      },
      error: (err) => {
        console.error('Failed to generate billing:', err);
        this.loading = false;
      }
    });
  } 
}
