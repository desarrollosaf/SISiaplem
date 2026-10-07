import { Component, OnInit, ElementRef, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  TicketsService,
  TicketResponsable,
  ResponsablePayload,
} from '../../../services/tickets.service';
import { AuthService, UserWithRoles } from '../../../services/auth.service';
import { BuscadorUsuarios } from '../buscador-usuarios';

const TIPO_LABEL: Record<string, string> = {
  asesoria_tecnica: 'Asesoría Técnica',
  baja_documental: 'Baja Documental',
  transferencia_primaria: 'Transferencia Primaria',
  prestamo_consulta: 'Préstamo y Consulta (Concentración)',
};

@Component({
  selector: 'app-tickets-admin',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class TicketsAdminComponent implements OnInit {
  private host = inject(ElementRef);

  cargando = signal(true);
  error = signal('');
  responsables = signal<TicketResponsable[]>([]);

  tipoLabel = TIPO_LABEL;

  // ── Responsables ──
  drawerOpen = signal(false);
  guardando = signal(false);
  editandoId = signal<number | null>(null);
  form: ResponsablePayload = this.formVacioResponsable();
  buscadorResponsable: BuscadorUsuarios;

  constructor(
    private ticketsSvc: TicketsService,
    private authSvc: AuthService,
  ) {
    this.buscadorResponsable = new BuscadorUsuarios((q) => this.authSvc.searchUsers(q));
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.ticketsSvc.listarResponsables().subscribe({
      next: (data) => {
        this.responsables.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
        this.cargando.set(false);
        console.error(err);
      },
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    if (!this.host.nativeElement.contains(ev.target)) {
      this.buscadorResponsable.cerrar();
    }
  }

  // ════════════════════════════ Responsables ════════════════════════════

  private formVacioResponsable(): ResponsablePayload {
    return { tipo_procedimiento: '', rfc_responsable: '', nombre_responsable: '' };
  }

  abrirNuevo() {
    this.editandoId.set(null);
    this.form = this.formVacioResponsable();
    this.buscadorResponsable.limpiar();
    this.drawerOpen.set(true);
  }

  abrirEditar(r: TicketResponsable) {
    this.editandoId.set(r.id);
    this.form = {
      tipo_procedimiento: r.tipo_procedimiento ?? '',
      rfc_responsable: r.rfc_responsable,
      nombre_responsable: r.nombre_responsable ?? '',
    };
    this.buscadorResponsable.establecer(r.nombre_responsable, r.rfc_responsable);
    this.drawerOpen.set(true);
  }

  cerrarDrawer() { this.drawerOpen.set(false); }

  onRfcInput(value: string) {
    this.form.rfc_responsable = '';
    this.form.nombre_responsable = '';
    this.buscadorResponsable.escribir(value);
  }

  seleccionarUsuario(u: UserWithRoles) {
    this.form.rfc_responsable = u.rfc;
    this.form.nombre_responsable = u.name;
    this.buscadorResponsable.establecer(u.name, u.rfc);
  }

  guardar() {
    this.guardando.set(true);
    const payload: ResponsablePayload = {
      ...this.form,
      tipo_procedimiento: this.form.tipo_procedimiento || null,
    };
    const id = this.editandoId();
    const obs = id ? this.ticketsSvc.actualizarResponsable(id, payload) : this.ticketsSvc.crearResponsable(payload);
    obs.subscribe({
      next: () => {
        this.guardando.set(false);
        this.drawerOpen.set(false);
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        alert('Error al guardar. Intenta de nuevo.');
        console.error(err);
      },
    });
  }

  toggle(r: TicketResponsable) {
    this.ticketsSvc.toggleResponsable(r.id).subscribe({
      next: () => this.cargar(),
      error: (err) => console.error(err),
    });
  }
}
