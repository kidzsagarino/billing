import { Component } from '@angular/core';
import { AppShellComponent } from './app-shell.component';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [AppShellComponent, RouterModule],
  templateUrl: './app.component.html'
})
export class AppComponent {}