import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

interface Tenant {
  ownerName: string;
  buildingNo: string;
  unitNo: string;
  moveInDate: Date;
  mobileNumber: string;
  email: string;
  details: Array<{
    condo: number;
    water: number;
    overdue: number;
    penalty: number;
    total: number;
    payments: number;
    balance: number;
  }>;
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

  
  // Filters
  years = [2022, 2023, 2024, 2025];
  months = ['Jan-25','Feb-25','Mar-25','Apr-25','May-25','Jun-25','Jul-25','Aug-25','Sep-25','Oct-25','Nov-25','Dec-25'];
  buildings = ['Building 1', 'Building 2', 'Building 3'];

  allColumns: string[] = ['item', ...this.months];

  selectedYear = new Date().getFullYear();
  selectedMonth = this.months[new Date().getMonth()];
  selectedBuilding = this.buildings[0];

  searchBuilding = '';
  searchUnit = '';

  isGenerated = false;

  displayedColumns: string[] = ['tenant', 'buildingNo', 'unitNo'];

  tenants: Tenant[] = [
    {
      ownerName: 'Juan Dela Cruz',
      buildingNo: '1',
      unitNo: '101',
      moveInDate: new Date('2023-05-15'),
      mobileNumber: '09171234567',
      email: 'juan.delacruz@example.com',
      details: [
        { condo:2000, water:575.48, overdue:0, penalty:0, total:2575.48, payments:2575.48, balance:0 },
        { condo:2000, water:572.33, overdue:0, penalty:0, total:2572.33, payments:2572.33, balance:0 },
        { condo:2000, water:589.65, overdue:0, penalty:0, total:2589.65, payments:2589.65, balance:0 },
        { condo:2000, water:631.35, overdue:0, penalty:0, total:2631.35, payments:2631.35, balance:0 },
        { condo:2000, water:490.42, overdue:0, penalty:0, total:2490.42, payments:2491, balance:-0.58 },
        { condo:2000, water:165, overdue:-0.58, penalty:0, total:2164.42, payments:2165, balance:-0.58 },
        { condo:2000, water:225.23, overdue:-0.58, penalty:0, total:2224.65, payments:2225, balance:-0.35 },
        { condo:0, water:0, overdue:0, penalty:0, total:0, payments:0, balance:0 },
        { condo:0, water:0, overdue:0, penalty:0, total:0, payments:0, balance:0 },
        { condo:0, water:0, overdue:0, penalty:0, total:0, payments:0, balance:0 },
        { condo:0, water:0, overdue:0, penalty:0, total:0, payments:0, balance:0 },
        { condo:0, water:0, overdue:0, penalty:0, total:0, payments:0, balance:0 },
      ]
    }
  ];

  selectedTenant: Tenant | null = null;
  billingItems = ['Condo Due','Water Bill','Overdue','Penalty','Total','Payments','Balance'];

  filteredTenants() {
    return this.tenants.filter(t =>
      (!this.searchBuilding || t.buildingNo.includes(this.searchBuilding)) &&
      (!this.searchUnit || t.unitNo.includes(this.searchUnit))
    );
  }

  showDetail(tenant: Tenant) {
    this.selectedTenant = tenant;
  }

  getBillingValue(item: string, monthIndex: number) {
    if (!this.selectedTenant) return 0;
    const detail = this.selectedTenant.details[monthIndex];
    switch(item) {
      case 'Condo Due': return detail.condo;
      case 'Water Bill': return detail.water;
      case 'Overdue': return detail.overdue;
      case 'Penalty': return detail.penalty;
      case 'Total': return detail.total;
      case 'Payments': return detail.payments;
      case 'Balance': return detail.balance;
      default: return 0;
    }
  }

  generateBilling() {
    console.log('Generate Billing for', this.selectedYear, this.selectedMonth, this.selectedBuilding);
    this.isGenerated = true;
  }

  generateSOA() {
    console.log('Generate SOA for', this.selectedYear, this.selectedMonth, this.selectedBuilding);
    this.isGenerated = true;
  }

  printStatement() {
    window.print();
  }
}
