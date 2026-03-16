import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, NgForm } from '@angular/forms';
import PaymentService from '../../services/payment.service';
import { UnitService } from '../../services/unit.service';
import { PaymentTypeOptions, PaymentType } from '../../constants/paymenttype';
import { HotToastService } from '@ngxpert/hot-toast';
import { MonthYearPipe } from '../../pipes/month-year.pipe';

import * as XLSX from 'xlsx';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, MatTableModule, FormsModule, MonthYearPipe],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent {

  constructor(private paymentService: PaymentService, private unitService: UnitService, private toast: HotToastService) { }

  selectedYear: number = 2025;
  selectedMonth: number = 10;
  searchUnit: string = '';
  selectedPaymentType: string = '';
  isEditing: boolean = false;

  showModal: boolean = false;
  payment = {
    Id: '',
    BillingMonth: '',
    BillingYear: '',
    PaymentDate: '',
    Bulding: '',
    UnitNumber: '',
    Payee: '',
    Amount: null,
    ARNumber: '',
    PaymentType: 0,
    RefNumber: ''
  };

  displayedColumns: string[] = ['date', 'tenant', 'amount', 'method', 'status'];
  paymentTypes = PaymentTypeOptions;

  payments: any = [];

  years: number[] = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i); // last 5 years
  months: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  moveInName: string = '';

  @ViewChild('paymentForm') paymentForm!: NgForm;

  ngOnInit() {
    const now = new Date();

    this.selectedMonth = now.getMonth() + 1;
    this.selectedYear = now.getFullYear();
    this.searchByBillingMonth();
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  loadPayments() {
    this.paymentService.getAllPayments().subscribe({
      next: (res) => {
        this.payments = res;
      }
      ,
      error: (err) => {
        this.toast.error('Error loading payments:', err);
      }
    });
  }

  loadPaymentsForBillingMonth() {
  }

  searchMoveinNameInUnit() {
    this.unitService.getMoveInNameByUnit(this.payment.UnitNumber).subscribe({
      next: (res) => {
        this.moveInName = res.FullName || '';
      },
      error: (err) => {
        this.toast.error('Error loading move-in name:', err);
      }
    });
  }

  submitPayment() {
    if (this.paymentForm.invalid) {
      this.paymentForm.control.markAllAsTouched();

      return;
    }

    this.payment.BillingMonth = `${this.payment.BillingYear}-${this.payment.BillingMonth.toString().padStart(2, '0')}`;
    this.paymentService.createPayment(this.payment).subscribe({
      next: (res) => {
        this.toast.success('Payment created successfully:', res);
        this.searchByBillingMonth();
      },
      error: (err) => {
        this.toast.error('Error creating payment: ' + (err.error?.error || err.error || err.message || 'Unknown error'));
      }
    });
    this.closeModal();
  }

  editPayment(payment: any) {
    this.payment.BillingYear = payment.BillingMonthRaw.split('-')[0];
    this.payment.BillingMonth = Number(payment.BillingMonthRaw.split('-')[1]).toString();
    this.payment.PaymentType = PaymentType[payment.PaymentType as keyof typeof PaymentType];
    this.payment.UnitNumber = payment.UnitNumber || '';
    this.moveInName = payment.MoveInFullName || '';
    this.payment.PaymentDate = payment.PaymentDateRaw;
    this.payment.Amount = payment.Amount || null;
    this.payment.ARNumber = payment.ARNUmber || '';
    this.payment.RefNumber = payment.RefNumber || '';
    this.payment.Id = payment.PaymentID || '';
    this.isEditing = true;
    this.openModal();
  }

  updatePayment() {

    if (this.paymentForm.invalid) {
      this.paymentForm.control.markAllAsTouched();
      return;
    }

    this.payment.BillingMonth = `${this.payment.BillingYear}-${this.payment.BillingMonth.toString().padStart(2, '0')}`;
    this.paymentService.updatePayment(this.payment.Id, this.payment).subscribe({
      next: (res: any) => {
        this.toast.success('Payment updated successfully:', res);
        this.searchByBillingMonth();
      },
      error: (err: any) => {
        this.toast.error('Error updating payment:', err);
      }
    });
    this.closeModal();
  }

  searchByUnitNumber() {
    if (!this.searchUnit) {
      this.loadPayments();
      return;
    }
    this.paymentService.searchByUnitNumber(this.searchUnit).subscribe({
      next: (res) => {
        this.payments = res;
      }
      ,
      error: (err) => {
        this.toast.error('Error loading payments by unit number:', err);
      }
    });
  }
  searchByBillingMonth() {
    if (!this.selectedYear || !this.selectedMonth) {
      this.loadPayments();
      return;
    }
    const billingMonth = `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, '0')}`;
    this.paymentService.searchByBillingMonth(billingMonth).subscribe({
      next: (res) => {
        this.payments = res;
      },
      error: (err) => {
        this.toast.error('Error loading payments by billing month:', err);
      }
    });
  }

  resetForm() {
    this.payment = {
      Id: '',
      BillingMonth: '',
      BillingYear: '',
      PaymentDate: '',
      Bulding: '',
      UnitNumber: '',
      Payee: '',
      Amount: null,
      ARNumber: '',
      PaymentType: 0,
      RefNumber: ''
    };
    this.isEditing = false;
  }

  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.payments);
    const workbook: XLSX.WorkBook = { Sheets: { 'Payments': worksheet }, SheetNames: ['Payments'] };

    let fileName = '';

    if (this.searchUnit.trim()) {
      fileName = `Payments_${this.searchUnit}.xlsx`;
    } else {
      fileName = `Payments_${this.selectedYear}-${this.selectedMonth.toString().padStart(2, '0')}.xlsx`;
    }
    XLSX.writeFile(workbook, fileName);
  }

}