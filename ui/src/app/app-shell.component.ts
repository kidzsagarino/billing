import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterModule, NgClass, NgIf],
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {
  sidebarOpen = true;
  
  constructor(private toast: HotToastService){}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = true;
  }
}
