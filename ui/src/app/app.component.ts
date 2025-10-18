import { Component } from '@angular/core';
import { AppShellComponent } from './app-shell.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [AppShellComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {}