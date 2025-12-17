import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  onLogin() {
    // Replace with real authentication logic
    if (this.username === 'admin' && this.password === 'password') {
      this.errorMessage = '';
      // Redirect or set authentication state here
      // Example: this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Invalid username or password.';
    }
  }
}