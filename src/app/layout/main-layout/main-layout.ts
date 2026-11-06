import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, Documento, respuestaBusqueda } from '../../services/auth.service';
import { GuiaService } from '../../services/guia.service';
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  host: { '(document:keydown.escape)': 'cerrarModalDocumentos()' },
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  guia = inject(GuiaService);

  buscar = signal('');
  resultado = signal<respuestaBusqueda | null>(null);
  tabActivo = signal<'digital' | 'fisico'>('digital');
  modalDocumentosAbierto = signal(false);

  textoBuscado = signal('');
  errorBusqueda = signal(false);

  totalResultados = computed(() => {
    const r = this.resultado();
    return r ? r.digital.length + r.fisico.length : 0;
  });

  resultadosTab = computed(() => this.resultado()?.[this.tabActivo()] ?? []);

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

  buscarExp() {
    const q = this.buscar().trim();

    if (!q) {
      this.resultado.set(null);
      return;
    }

    this.guia.buscarDocumentos(q).subscribe({
      next: (data: respuestaBusqueda) => {
        this.buscar.set('');
        this.resultado.set(data);
        this.textoBuscado.set(q);
        this.errorBusqueda.set(false);
        this.tabActivo.set(data.digital.length > 0 || data.fisico.length === 0 ? 'digital' : 'fisico');
        this.modalDocumentosAbierto.set(true);
      },
      error: (error) => {
        console.error('Error al buscar documentos:', error);
        this.resultado.set(null);
        this.textoBuscado.set(q);
        this.errorBusqueda.set(true);
        this.modalDocumentosAbierto.set(true);
      },
    });
  }

  tituloResultado(item: Documento): string {
    return item.titulo || item.tipo || item.archivo?.split('/').pop() || 'Documento';
  }

  cerrarModalDocumentos() {
    this.modalDocumentosAbierto.set(false);
  }
}
