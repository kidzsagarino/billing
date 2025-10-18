// Feature components (standalone) you’ve built
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CustomersComponent } from './features/customers/customers.component';
import { UnitsComponent } from './features/units/units.component';
import { InvoicesComponent } from './features/invoices/invoices.component';
import { BillingRunComponent } from './features/billing-run/billing-run.component';
import { PaymentsComponent } from './features/payments/payments.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'customers', component: CustomersComponent },
  { path: 'units', component: UnitsComponent },
  { path: 'invoices', component: InvoicesComponent },
  { path: 'billing-run', component: BillingRunComponent },
  { path: 'payments', component: PaymentsComponent },
  { path: '**', redirectTo: 'dashboard' }
];