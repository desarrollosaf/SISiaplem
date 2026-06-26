import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  showPassword = false;
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  onLogin() {
    this.router.navigate(['/dashboard']);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
