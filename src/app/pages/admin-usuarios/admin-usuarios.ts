import { Component, ElementRef, OnInit, ViewChild, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, UserWithRoles } from '../../services/auth.service';

const PERMISOS_LABELS: Record<string, string> = {
  'transferencias.revisar': 'Revisar transferencias',
  'transferencias.recibir': 'Recibir transferencias',
};

const POPOVER_WIDTH = 260;

@Component({
  selector: 'app-admin-usuarios',
  imports: [FormsModule],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.css',
})
export class AdminUsuariosComponent implements OnInit {
  usuarios = signal<UserWithRoles[]>([]);
  cargando = signal(true);

  roles = signal<{ id: number; name: string }[]>([]);
  permisos = signal<{ id: number; name: string }[]>([]);

  busqueda = '';
  resultados = signal<UserWithRoles[]>([]);
  buscando = signal(false);
  private debounce: ReturnType<typeof setTimeout> | undefined;

  ocupado = signal<number | null>(null);

  @ViewChild('popoverEl') popoverEl?: ElementRef<HTMLElement>;

  popoverAbiertoId = signal<number | null>(null);
  popoverPos = signal<{ top: number; left: number }>({ top: 0, left: 0 });

  popoverUsuario = computed<UserWithRoles | null>(() => {
    const id = this.popoverAbiertoId();
    if (id == null) return null;
    return this.usuarios().find((u) => u.id === id) ?? this.resultados().find((u) => u.id === id) ?? null;
  });

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.cargar();
    this.auth.listRoles().subscribe({ next: (d) => this.roles.set(d) });
    this.auth.listPermissions().subscribe({ next: (d) => this.permisos.set(d) });
  }

  cargar() {
    this.cargando.set(true);
    this.auth.listUsers().subscribe({
      next: (d) => { this.usuarios.set(d); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  permisoLabel(name: string): string {
    return PERMISOS_LABELS[name] ?? name;
  }

  onBuscarInput() {
    clearTimeout(this.debounce);
    const q = this.busqueda.trim();
    if (q.length < 2) {
      this.resultados.set([]);
      return;
    }
    this.debounce = setTimeout(() => {
      this.buscando.set(true);
      this.auth.searchUsers(q).subscribe({
        next: (d) => { this.resultados.set(d); this.buscando.set(false); },
        error: () => this.buscando.set(false),
      });
    }, 350);
  }

  tieneRol(u: UserWithRoles, role: string): boolean {
    return u.roles.includes(role);
  }

  tienePermiso(u: UserWithRoles, permiso: string): boolean {
    return u.permissions.includes(permiso);
  }

  abrirPopover(u: UserWithRoles, event: MouseEvent) {
    event.stopPropagation();
    if (this.popoverAbiertoId() === u.id) {
      this.cerrarPopover();
      return;
    }
    const btn = event.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const margin = 8;
    this.popoverPos.set({
      top: rect.bottom + 6,
      left: Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 16),
    });
    this.popoverAbiertoId.set(u.id);

    // El popover aún no existe en el DOM hasta el siguiente ciclo de render;
    // medimos su alto real para voltearlo hacia arriba si no cabe debajo del botón.
    setTimeout(() => {
      const alto = this.popoverEl?.nativeElement.offsetHeight ?? 0;
      if (!alto) return;
      const espacioAbajo = window.innerHeight - rect.bottom - margin;
      if (alto > espacioAbajo) {
        this.popoverPos.update((pos) => ({ ...pos, top: Math.max(margin, rect.top - alto - 6) }));
      }
    }, 0);
  }

  cerrarPopover() {
    this.popoverAbiertoId.set(null);
  }

  toggleRol(u: UserWithRoles, role: string) {
    if (this.ocupado()) return;
    this.ocupado.set(u.id);
    const op = this.tieneRol(u, role) ? this.auth.removeRole(u.id, role) : this.auth.assignRole(u.id, role);
    op.subscribe({
      next: () => { this.ocupado.set(null); this.cargar(); this.rebuscar(); },
      error: () => { this.ocupado.set(null); alert('No se pudo actualizar el rol.'); },
    });
  }

  togglePermiso(u: UserWithRoles, permiso: string) {
    if (this.ocupado()) return;
    this.ocupado.set(u.id);
    const op = this.tienePermiso(u, permiso)
      ? this.auth.removePermission(u.id, permiso)
      : this.auth.assignPermission(u.id, permiso);
    op.subscribe({
      next: () => { this.ocupado.set(null); this.cargar(); this.rebuscar(); },
      error: () => { this.ocupado.set(null); alert('No se pudo actualizar el permiso.'); },
    });
  }

  private rebuscar() {
    if (this.busqueda.trim().length >= 2) this.onBuscarInput();
  }
}
