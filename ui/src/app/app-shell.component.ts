import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { AppNavComponent } from './app-nav/app-nav.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterModule, NgClass, NgIf, AppNavComponent],
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {
  sidebarOpen = true;
  
  constructor(private toast: HotToastService){}

}
