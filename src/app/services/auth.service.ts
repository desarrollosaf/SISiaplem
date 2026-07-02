import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

const API = 'http://localhost:3050/api/auth';
const TOKEN_KEY = 'siaplem_token';

export interface AuthUser {
  id: number;
  name: string;
  rfc: string;
  email: string;
  roles: string[];
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export interface UserWithRoles extends AuthUser {
  cambio_contrasena: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private _user = signal<AuthUser | null>(this.loadUserFromToken());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly roles = computed(() => this._user()?.roles ?? []);
  readonly userName = computed(() => this._user()?.name ?? '');
  readonly userRfc = computed(() => this._user()?.rfc ?? '');

  hasRole(...roles: string[]): boolean {
    const userRoles = this._user()?.roles ?? [];
    if (userRoles.includes('ADMIM')) return true;
    return roles.some(r => userRoles.includes(r));
  }

  login(rfc: string, password: string) {
    return this.http.post<LoginResponse>(`${API}/login`, { rfc, password }).pipe(
      tap(res => {
        if (this.isBrowser) localStorage.setItem(TOKEN_KEY, res.access_token);
        this._user.set(res.user);
      }),
    );
  }

  logout() {
    if (this.isBrowser) localStorage.removeItem(TOKEN_KEY);
    this._user.set(null);
    void this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  listUsers() {
    return this.http.get<UserWithRoles[]>(`${API}/users`);
  }

  listRoles() {
    return this.http.get<{ id: number; name: string }[]>(`${API}/roles`);
  }

  assignRole(userId: number, role: string) {
    return this.http.post(`${API}/users/${userId}/roles`, { role });
  }

  removeRole(userId: number, role: string) {
    return this.http.delete(`${API}/users/${userId}/roles/${role}`);
  }

  private loadUserFromToken(): AuthUser | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as {
        sub: number; rfc: string; name: string; email: string; roles: string[]; exp: number;
      };
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem(TOKEN_KEY);
        return null;
      }
      return { id: payload.sub, rfc: payload.rfc, name: payload.name, email: payload.email, roles: payload.roles };
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  }
}
