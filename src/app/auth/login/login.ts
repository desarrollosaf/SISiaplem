import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  credentials = { rfc: '', password: '' };
  showPassword = false;
  loading = signal(false);
  error = signal('');
  currentYear = new Date().getFullYear();

  constructor() {
    const sinRol = this.route.snapshot.queryParamMap.get('error') === 'sin-rol';
    if (sinRol) this.error.set('Tu usuario no tiene roles asignados. Contacta al administrador.');
  }

  onLogin() {
    if (!this.credentials.rfc || !this.credentials.password) {
      this.error.set('Ingresa tu RFC y contraseña.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.credentials.rfc, this.credentials.password).subscribe({
      next: (res) => {
        if (!res.user.roles || res.user.roles.length === 0) {
          this.loading.set(false);
          this.error.set('Tu usuario no tiene roles asignados. Contacta al administrador.');
          return;
        }
        void this.router.navigate(['/home']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Credenciales incorrectas. Intenta de nuevo.');
      },
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
