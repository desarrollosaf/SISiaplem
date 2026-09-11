import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TicketsService, Ticket } from '../../../services/tickets.service';
import { AuthService } from '../../../services/auth.service';

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
};

@Component({
  selector: 'app-ticket-detalle',
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css',
})
export class TicketDetalleComponent implements OnInit {
  id: number;
  cargando = signal(true);
  error = signal('');
  ticket = signal<Ticket | null>(null);

  tipoLabel = TIPO_LABEL;
  estadoLabel = ESTADO_LABEL;

  asignarOpen = signal(false);
  estadoOpen = signal(false);
  cerrarOpen = signal(false);
  guardando = signal(false);

  formAsignar = { rfc_asignado: '', fecha_programada: '', modalidad_lugar: '' };
  formEstado = { estado: 'en_proceso', comentario: '' };
  formCerrar = { ruta_acta: '', comentarios_cierre: '', dictamen_procedencia: 'procedente', programacion_traslado: '' };

  private get rfc() { return this.auth.userRfc(); }

  constructor(
    private ticketsSvc: TicketsService,
    private auth: AuthService,
    private aRoute: ActivatedRoute,
  ) {
    this.id = Number(this.aRoute.snapshot.paramMap.get('id'));
  }

  ngOnInit() {
    this.cargar();
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

  abrirAsignar() {
    const t = this.ticket();
    this.formAsignar = {
      rfc_asignado: t?.rfc_asignado ?? '',
      fecha_programada: t?.fecha_programada ? t.fecha_programada.substring(0, 16) : '',
      modalidad_lugar: t?.modalidad_lugar ?? '',
    };
    this.asignarOpen.set(true);
  }
  cerrarAsignar() { this.asignarOpen.set(false); }

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
}
