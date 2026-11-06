import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TicketsService, Ticket, TipoProcedimiento, CrearTicketPayload } from '../../services/tickets.service';
import { AuthService } from '../../services/auth.service';

const TIPO_LABEL: Record<TipoProcedimiento, string> = {
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
  pendiente_autorizacion: 'Pendiente de autorización',
  autorizado: 'Autorizado',
};

@Component({
  selector: 'app-tickets',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class TicketsComponent implements OnInit {
  cargando = signal(true);
  error = signal('');
  tickets = signal<Ticket[]>([]);

  filtroTipo = signal('');
  filtroEstado = signal('');

  tipoLabel = TIPO_LABEL;
  estadoLabel = ESTADO_LABEL;

  drawerOpen = signal(false);
  guardando = signal(false);

  formCrear!: CrearTicketPayload;

  ticketsFiltrados = computed(() => {
    const tipo = this.filtroTipo();
    const estado = this.filtroEstado();
    return this.tickets().filter(
      (t) => (!tipo || t.tipo_procedimiento === tipo) && (!estado || t.estado === estado),
    );
  });

  private get rfc() { return this.auth.userRfc(); }
  get esAdmin() { return this.auth.hasRole('ADMIM'); }

  constructor(
    private ticketsSvc: TicketsService,
    private auth: AuthService,
    private router: Router,
  ) {
    this.formCrear = this.formVacio();
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.ticketsSvc.listar({ rfc_usuario: this.rfc, es_admin: this.esAdmin }).subscribe({
      next: (data) => {
        this.tickets.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
        this.cargando.set(false);
        console.error(err);
      },
    });
  }

  private formVacio(): CrearTicketPayload {
    const user = this.auth.user();
    return {
      tipo_procedimiento: 'asesoria_tecnica',
      asunto: '',
      categoria: '',
      descripcion: '',
      rfc_solicitante: user?.rfc ?? '',
      nombre_solicitante: user?.name ?? '',
      correo_solicitante: user?.email ?? '',
      extension_solicitante: '',
      numero_oficio_turno: '',
      subtipo: 'designacion',
      nombre_completo_entrante: '',
      cargo_puesto: '',
      correo_institucional: '',
      telefono_extension: '',
      ruta_oficio_designacion: '',
      tipo_solicitud_prestamo: 'prestamo',
      persona_habilitada: '',
      rfc_actor: '',
    };
  }

  abrirNuevo() {
    this.formCrear = this.formVacio();
    this.drawerOpen.set(true);
  }

  cerrarDrawer() { this.drawerOpen.set(false); }

  guardar() {
    this.guardando.set(true);
    const payload: CrearTicketPayload = { ...this.formCrear, rfc_actor: this.rfc };
    this.ticketsSvc.crear(payload).subscribe({
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

  verDetalle(t: Ticket) {
    this.router.navigate(['/tickets/detalle', t.id]);
  }
}
