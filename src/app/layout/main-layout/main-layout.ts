import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayoutComponent {
  auth = inject(AuthService);

  sidebarCollapsed = signal(false);
  openMenus: Record<string, boolean> = { tramite: true };

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleMenu(key: string) {
    this.openMenus[key] = !this.openMenus[key];
  }

  isOpen(key: string): boolean {
    return this.openMenus[key] ?? false;
  }

  logout() {
    this.auth.logout();
  }

  get initials(): string {
    const name = this.auth.userName();
    return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || 'U';
  }
}
