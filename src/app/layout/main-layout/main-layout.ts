import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, respuestaBusqueda } from '../../services/auth.service';
import { GuiaService } from '../../services/guia.service';
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  guia = inject(GuiaService);

  buscar = signal('');
  resultado = signal<respuestaBusqueda | null>(null);
  tabActivo = signal<'digital' | 'fisico'>('digital');

  tiposDocumento: ('digital' | 'fisico')[] = [
  'digital',
  'fisico',
];

  seleccionarTab(tipo: 'digital' | 'fisico') {
    this.tabActivo.set(tipo);
  }

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

  buscarExp(){
    const q = this.buscar().trim();

    if (!q) {
      this.resultado.set(null);
      return;
    }

    this.guia.buscarDocumentos(q).subscribe({
    next: (data: respuestaBusqueda) => {
      this.resultado.set(data);
    },
    error: (error) => {
      console.error('Error al buscar documentos:', error);
    },
  });


    // const lista = this.resultado() ?? [];

    // const filtrados = q
    //   ? lista.filter((f) =>
    //       String(f.folio ?? '').toLowerCase().includes(q) ||
    //       String(f.titulo_doc ?? '').toLowerCase().includes(q) ||
    //       String(f.referencia_documento ?? '').toLowerCase().includes(q)
    //     )
    //   : lista;
    // return [...filtrados].sort((a, b) => this.compararFolio(a.folio, b.folio));
  }
}
