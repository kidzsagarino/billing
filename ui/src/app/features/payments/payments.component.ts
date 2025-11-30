import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import PaymentService from '../../services/payment.service';
import { UnitService } from '../../services/unit.service';
import { PaymentTypeOptions, PaymentType  } from '../../constants/paymenttype';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, MatTableModule, FormsModule],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent {

  constructor(private paymentService: PaymentService, private unitService: UnitService) {}

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

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  onSearchChange() {
    this.loadPayments();
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

  ngOnInit() {
    this.loadPayments();
  }

  submitPayment() {
    this.payment.BillingMonth = `${this.payment.BillingYear}-${this.payment.BillingMonth.toString().padStart(2, '0')}`;
    this.paymentService.createPayment(this.payment).subscribe({
      next: (res) => {
        console.log('Payment created successfully:',  res); 
        this.loadPayments();
      }
      ,
      error: (err) => {
        console.error('Error creating payment:', err);
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