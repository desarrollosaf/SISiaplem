import { Component, OnInit, ElementRef, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TicketsService, Ticket } from '../../../services/tickets.service';
import { AuthService, UserWithRoles } from '../../../services/auth.service';
import { BuscadorUsuarios } from '../buscador-usuarios';

const TIPO_LABEL: Record<string, string> = {
  directorio_responsables: 'Directorio de Responsables',
  asesoria_tecnica: 'Asesoría Técnica',
  baja_documental: 'Baja Documental',
  transferencia_primaria: 'Transferencia Primaria',
  prestamo_consulta: 'Préstamo y Consulta (Concentración)',
};

const ESTADO_LABEL: Record<string, string> = {
  nuevo: 'Nuevo',
  turnado: 'Turnado',
  en_proceso: 'En proceso',
  programado: 'Programado',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
  rechazado: 'Rechazado',
  no_existente: 'No existente',
  disponible: 'Disponible para préstamo/consulta',
  pendiente_autorizacion: 'Pendiente de autorización del Titular',
  autorizado: 'Autorizado',
};

@Component({
  selector: 'app-ticket-detalle',
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css',
})
export class TicketDetalleComponent implements OnInit {
  private host = inject(ElementRef);

  id: number;
  cargando = signal(true);
  error = signal('');
  ticket = signal<Ticket | null>(null);

  tipoLabel = TIPO_LABEL;
  estadoLabel = ESTADO_LABEL;

  asignarOpen = signal(false);
  estadoOpen = signal(false);
  cerrarOpen = signal(false);
  autorizarOpen = signal(false);
  guardando = signal(false);

  formAsignar = { rfc_asignado: '', fecha_programada: '', modalidad_lugar: '' };
  formEstado = { estado: 'en_proceso', comentario: '' };
  formCerrar = { ruta_acta: '', comentarios_cierre: '', dictamen_procedencia: 'procedente', programacion_traslado: '' };
  formAutorizar = { rfc_titular: '', password_firma: '', comentario: '' };

  buscadorAsignar: BuscadorUsuarios;

  private get rfc() { return this.auth.userRfc(); }
  get esAdmin() { return this.auth.hasRole('ADMIM'); }
  // El "validador" es la persona actualmente asignada a atender el ticket.
  get esValidador() { return !!this.ticket()?.rfc_asignado && this.ticket()?.rfc_asignado === this.rfc; }
  // Puede cambiar estado / cerrar: el admin, o el validador asignado.
  get puedeGestionar() { return this.esAdmin || this.esValidador; }
  // Solo el Titular configurado para este ticket (o el admin) puede firmar la autorización.
  get esTitularDeEsteTicket() { return !!this.ticket()?.rfc_titular && this.ticket()?.rfc_titular === this.rfc; }
  get puedeAutorizar() { return this.esAdmin || this.esTitularDeEsteTicket; }

  constructor(
    private ticketsSvc: TicketsService,
    private auth: AuthService,
    private aRoute: ActivatedRoute,
  ) {
    this.id = Number(this.aRoute.snapshot.paramMap.get('id'));
    this.buscadorAsignar = new BuscadorUsuarios((q) => this.auth.searchUsers(q));
  }

  ngOnInit() {
    this.cargar();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    if (!this.host.nativeElement.contains(ev.target)) {
      this.buscadorAsignar.cerrar();
    }
  }

  cargar() {
    this.cargando.set(true);
    this.ticketsSvc.obtener(this.id).subscribe({
      next: (data) => {
        this.ticket.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
        this.cargando.set(false);
        console.error(err);
      },
    });
  }

  get esBajaDocumental() { return this.ticket()?.tipo_procedimiento === 'baja_documental'; }
  get yaCerrado() { return this.ticket()?.estado === 'cerrado'; }
  get pendienteAutorizacion() { return this.ticket()?.estado === 'pendiente_autorizacion'; }

  abrirAsignar() {
    const t = this.ticket();
    this.formAsignar = {
      rfc_asignado: t?.rfc_asignado ?? '',
      fecha_programada: t?.fecha_programada ? t.fecha_programada.substring(0, 16) : '',
      modalidad_lugar: t?.modalidad_lugar ?? '',
    };
    this.buscadorAsignar.establecer(null, t?.rfc_asignado ?? '');
    this.asignarOpen.set(true);
  }
  cerrarAsignar() { this.asignarOpen.set(false); }

  onAsignarInput(value: string) {
    this.formAsignar.rfc_asignado = '';
    this.buscadorAsignar.escribir(value);
  }

  seleccionarAsignado(u: UserWithRoles) {
    this.formAsignar.rfc_asignado = u.rfc;
    this.buscadorAsignar.establecer(u.name, u.rfc);
  }

  guardarAsignar() {
    this.guardando.set(true);
    this.ticketsSvc.asignar(this.id, { ...this.formAsignar, rfc_actor: this.rfc }).subscribe({
      next: (data) => { this.ticket.set(data); this.guardando.set(false); this.asignarOpen.set(false); },
      error: (err) => { this.guardando.set(false); alert('Error al guardar. Intenta de nuevo.'); console.error(err); },
    });
  }

  abrirEstado() {
    this.formEstado = { estado: this.ticket()?.estado ?? 'en_proceso', comentario: '' };
    this.estadoOpen.set(true);
  }
  cerrarEstado() { this.estadoOpen.set(false); }

  guardarEstado() {
    this.guardando.set(true);
    this.ticketsSvc.cambiarEstado(this.id, { ...this.formEstado, rfc_actor: this.rfc }).subscribe({
      next: (data) => { this.ticket.set(data); this.guardando.set(false); this.estadoOpen.set(false); },
      error: (err) => { this.guardando.set(false); alert('Error al guardar. Intenta de nuevo.'); console.error(err); },
    });
  }

  abrirCerrar() {
    this.formCerrar = {
      ruta_acta: this.ticket()?.ruta_acta ?? '',
      comentarios_cierre: this.ticket()?.comentarios_cierre ?? '',
      dictamen_procedencia: this.ticket()?.bajaDetalle?.dictamen_procedencia ?? 'procedente',
      programacion_traslado: this.ticket()?.bajaDetalle?.programacion_traslado ?? '',
    };
    this.cerrarOpen.set(true);
  }
  cerrarCerrar() { this.cerrarOpen.set(false); }

  guardarCierre() {
    this.guardando.set(true);
    this.ticketsSvc.cerrar(this.id, { ...this.formCerrar, rfc_actor: this.rfc }).subscribe({
      next: (data) => { this.ticket.set(data); this.guardando.set(false); this.cerrarOpen.set(false); },
      error: (err) => { this.guardando.set(false); alert('Error al guardar. Intenta de nuevo.'); console.error(err); },
    });
  }

  abrirAutorizar() {
    this.formAutorizar = { rfc_titular: this.rfc, password_firma: '', comentario: '' };
    this.autorizarOpen.set(true);
  }
  cerrarAutorizar() { this.autorizarOpen.set(false); }

  guardarAutorizar(firmado: boolean) {
    if (firmado && !this.formAutorizar.password_firma) {
      alert('Captura la contraseña de firma electrónica para continuar (de momento se simula: cualquier valor es válido).');
      return;
    }
    this.guardando.set(true);
    this.ticketsSvc
      .autorizarTitular(this.id, {
        firmado,
        rfc_titular: this.formAutorizar.rfc_titular,
        password_firma: this.formAutorizar.password_firma,
        comentario: this.formAutorizar.comentario,
        rfc_actor: this.rfc,
        rol_actor: 'Titular',
        es_admin: this.esAdmin,
      })
      .subscribe({
        next: (data) => { this.ticket.set(data); this.guardando.set(false); this.autorizarOpen.set(false); },
        error: (err) => { this.guardando.set(false); alert('Error al guardar. Intenta de nuevo.'); console.error(err); },
      });
  }
}
