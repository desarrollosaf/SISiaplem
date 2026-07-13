import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const API = `${environment.endpoint}api/auth`;
const TOKEN_KEY = 'siaplem_token';

export interface AuthUser {
  id: number;
  name: string;
  rfc: string;
  email: string;
  roles: string[];
  permissions: string[];
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

  hasPermission(...permissions: string[]): boolean {
    const user = this._user();
    if (!user) return false;
    if (user.roles.includes('ADMIM')) return true;
    return permissions.some(p => user.permissions.includes(p));
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

  searchUsers(q: string) {
    return this.http.get<UserWithRoles[]>(`${API}/users/search`, { params: { q } });
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

  listPermissions() {
    return this.http.get<{ id: number; name: string }[]>(`${API}/permissions`);
  }

  assignPermission(userId: number, permission: string) {
    return this.http.post(`${API}/users/${userId}/permissions`, { permission });
  }

  removePermission(userId: number, permission: string) {
    return this.http.delete(`${API}/users/${userId}/permissions/${permission}`);
  }

  private loadUserFromToken(): AuthUser | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      // JWT usa Base64URL; atob solo acepta Base64 estándar → convertir antes de decodificar
      const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(b64)) as {
        sub: number; rfc: string; name: string; email: string; roles: string[]; permissions: string[]; exp: number;
      };
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem(TOKEN_KEY);
        return null;
      }
      return {
        id: payload.sub,
        rfc: payload.rfc,
        name: payload.name,
        email: payload.email,
        roles: payload.roles ?? [],
        permissions: payload.permissions ?? [],
      };
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  }
}
