import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayoutComponent {
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
}
