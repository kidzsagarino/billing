export interface BillingRecord {
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