import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, NgForm } from '@angular/forms';
import PaymentService from '../../services/payment.service';
import { UnitService } from '../../services/unit.service';
import { PaymentTypeOptions, PaymentType  } from '../../constants/paymenttype';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, MatTableModule, FormsModule],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent {

  constructor(private paymentService: PaymentService, private unitService: UnitService, private toast: HotToastService) {}

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

  payments:any = [];

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
        console.log('Payments loaded:', res);
        this.payments = res;
      }
      ,
      error: (err) => {
        console.error('Error loading payments:', err);
      }
    });
  }

  loadPaymentsForBillingMonth(){
  }

  searchMoveinNameInUnit() {
    this.unitService.getMoveInNameByUnit(this.payment.UnitNumber).subscribe({
      next: (res) => {  
        this.moveInName = res.FullName || '';
      } ,
      error: (err) => {
        console.error('Error loading move-in name:', err);
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
        console.log('Payment created successfully:',  res); 
        this.loadPayments();
      }
      ,
      error: (err) => {
        this.toast.error('Error creating payment: ' + (err.error?.error || err.error || err.message || 'Unknown error'));
      }
    });
    this.closeModal();
  }

  editPayment(payment: any) {
    this.payment = { ...payment };
    this.payment.PaymentType = PaymentType[payment.PaymentType as keyof typeof PaymentType];
    this.payment.BillingYear = payment.BillingMonth.split('-')[0];
    this.payment.BillingMonth = Number(payment.BillingMonth.split('-')[1]).toString();
    this.payment.UnitNumber = payment.unit?.UnitNumber || '';
    this.payment.PaymentDate = payment.PaymentDate.split('T')[0];
    this.moveInName = payment.unit?.moveins?.[0]?.FullName || '';
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
        console.log('Payment updated successfully:',  res); 
        this.loadPayments();
      }
      ,
      error: (err: any) => {
        console.error('Error updating payment:', err);
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
        console.log('Payments loaded by unit number:', res);
        this.payments = res;
      }
      ,
      error: (err) => {
        console.error('Error loading payments by unit number:', err);
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
        console.log('Payments loaded by billing month:', res);
        this.payments = res;
      } ,
      error: (err) => {
        console.error('Error loading payments by billing month:', err);
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

}