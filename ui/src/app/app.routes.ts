// Feature components (standalone) you’ve built
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MoveInComponent } from './features/movein/movein.component';
import { UnitsComponent } from './features/units/units.component';
import { InvoicesComponent } from './features/invoices/invoices.component';
import { BillingRunComponent } from './features/billing-run/billing-run.component';
import { PaymentsComponent } from './features/payments/payments.component';
import { WaterReadingComponent } from './features/water-reading/water-reading.component';
import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { LoginComponent } from './features/login/login.component';
import { AppShellComponent } from './app-shell.component';

export const routes: Routes = [
  // Routes inside AppShell
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard], // protect all children by default
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'moveins', component: MoveInComponent },
      { path: 'units', component: UnitsComponent },
      { path: 'invoices', component: InvoicesComponent },
      { path: 'billing-run', component: BillingRunComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: 'water-reading', component: WaterReadingComponent }
    ]
  },

  { path: 'login', component: LoginComponent },
];