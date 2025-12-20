import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-app-nav',
  standalone: true,
  imports: [NgClass, NgIf, RouterModule],
  templateUrl: './app-nav.component.html',
  styleUrl: './app-nav.component.scss'
})
export class AppNavComponent {
  sidebarOpen = true;
  
  constructor(private router: Router, private loginService: LoginService) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = true;
  }

  logout(){
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}
