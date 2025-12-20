import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
LoginService

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [FormsModule, CommonModule],
  standalone: true
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  
  constructor(private loginService: LoginService, private router: Router ) {}

  ngOnit() {
     if (this.loginService.isLoggedIn()) {
      this.router.navigate(['/moveins']);
    }
  }

  onLogin() {
    this.loginService.login(this.username, this.password).subscribe({
      next: (data: any) => {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('billing.authToken', data?.token);
        this.router.navigate(['/moveins']);
      },
      error: (err) => {
        this.errorMessage = 'Invalid username or password';
      }
    });
  }
}