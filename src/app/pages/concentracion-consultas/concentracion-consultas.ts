import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  ConsultasService,
  SolicitudConsulta,
  SolicitudConsultaDetalle,
} from '../../services/consultas.service';
import { GuiaService, ExpedienteDetalle } from '../../services/guia.service';
import { AuthService } from '../../services/auth.service';

type Tab = 'revisar' | 'autorizadas' | 'rechazadas';

@Component({
  selector: 'app-concentracion-consultas',
  imports: [CommonModule, FormsModule, NgClass],
  templateUrl: './concentracion-consultas.html',
  styleUrl: './concentracion-consultas.css',
})
export class ConcentracionConsultasComponent implements OnInit {
  private consultasSvc = inject(ConsultasService);
  private guia = inject(GuiaService);
  protected auth = inject(AuthService);
  private http = inject(HttpClient);

  tab = signal<Tab>('revisar');
  cargando = signal(true);

  pendientes = signal<SolicitudConsulta[]>([]);
  autorizadas = signal<SolicitudConsulta[]>([]);
  rechazadas = signal<SolicitudConsulta[]>([]);

  rechazoId = signal<number | null>(null);
  motivoRechazo = '';
  autorizarId = signal<number | null>(null);
  fechaLimite = '';
  readonly minFechaLimite = this.manana();

  detalleId = signal<number | null>(null);
  detalle = signal<SolicitudConsultaDetalle | null>(null);
  cargandoDetalle = signal(false);

  // ── Visor de documentos (idéntico al que usa el RAT para consultar) ──
  expedienteAbierto = signal<number | null>(null);
  expedienteDetalles = signal<Record<number, ExpedienteDetalle>>({});
  cargandoExpediente = signal<number | null>(null);
  tabExpediente = signal<Record<number, 'digital' | 'fisico'>>({});
  documentoError = signal('');

  ngOnInit() {
    this.tab.set(this.auth.hasPermission('transferencias.revisar') ? 'revisar' : 'autorizadas');
    this.cargarTodo();
  }

  private get rfc() {
    return this.auth.userRfc();
  }

  private manana(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  private cargarTodo() {
    this.cargando.set(true);
    this.consultasSvc.getPendientes().subscribe({
      next: (data) => { this.pendientes.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
    this.consultasSvc.getAutorizadas().subscribe({ next: (data) => this.autorizadas.set(data) });
    this.consultasSvc.getRechazadas().subscribe({ next: (data) => this.rechazadas.set(data) });
  }

  cambiarTab(t: Tab) {
    this.tab.set(t);
  }

  pedirConfirmarAutorizar(id: number) {
    this.fechaLimite = '';
    this.autorizarId.set(id);
  }

  cancelarAutorizar() {
    this.autorizarId.set(null);
  }

  confirmarAutorizar() {
    const id = this.autorizarId();
    if (id == null || !this.fechaLimite) return;
    this.consultasSvc.autorizar(id, this.rfc, true, undefined, this.fechaLimite).subscribe({
      next: () => { this.autorizarId.set(null); this.cargarTodo(); },
    });
  }

  abrirRechazo(id: number) {
    this.rechazoId.set(id);
    this.motivoRechazo = '';
  }

  cancelarRechazo() {
    this.rechazoId.set(null);
  }

  confirmarRechazo() {
    const id = this.rechazoId();
    if (id == null) return;
    this.consultasSvc.autorizar(id, this.rfc, false, this.motivoRechazo).subscribe({
      next: () => { this.rechazoId.set(null); this.cargarTodo(); },
    });
  }

  verDetalle(id: number) {
    this.detalleId.set(id);
    this.detalle.set(null);
    this.cargandoDetalle.set(true);
    this.expedienteAbierto.set(null);
    this.expedienteDetalles.set({});
    this.consultasSvc.getDetalle(id).subscribe({
      next: (data) => { this.detalle.set(data); this.cargandoDetalle.set(false); },
      error: () => this.cargandoDetalle.set(false),
    });
  }

  cerrarDetalle() {
    this.detalleId.set(null);
    this.detalle.set(null);
    this.expedienteAbierto.set(null);
    this.expedienteDetalles.set({});
  }

  estadoClase(estado: string, vigente?: boolean): string {
    if (estado === 'autorizada' && vigente === false) return 'status-closed';
    switch (estado) {
      case 'pendiente': return 'status-pending';
      case 'autorizada': return 'status-active';
      case 'rechazada': return 'status-closed';
      default: return '';
    }
  }

  estadoLabel(estado: string, vigente?: boolean): string {
    if (estado === 'autorizada' && vigente === false) return 'Vencida';
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'autorizada': return 'Autorizada';
      case 'rechazada': return 'Rechazada';
      default: return estado;
    }
  }

  // ── Explorador de documentos ──

  toggleExpediente(id: number) {
    if (this.expedienteAbierto() === id) {
      this.expedienteAbierto.set(null);
      return;
    }
    this.expedienteAbierto.set(id);
    if (this.expedienteDetalles()[id]) return;

    this.cargandoExpediente.set(id);
    this.guia.getExpedienteDetalle(id).subscribe({
      next: (data) => {
        this.expedienteDetalles.update((map) => ({ ...map, [id]: data }));
        this.tabExpediente.update((map) => ({
          ...map,
          [id]: data.digitales.length + data.registrosDocs.length > 0 ? 'digital' : 'fisico',
        }));
        this.cargandoExpediente.set(null);
      },
      error: () => this.cargandoExpediente.set(null),
    });
  }

  tabDeExpediente(id: number): 'digital' | 'fisico' {
    return this.tabExpediente()[id] ?? 'digital';
  }

  cambiarTabExpediente(id: number, t: 'digital' | 'fisico') {
    this.tabExpediente.update((map) => ({ ...map, [id]: t }));
  }

  iconoArchivo(nombre: string | null): string {
    const ext = (nombre ?? '').split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'bi-file-earmark-pdf-fill icon-pdf';
    if (['doc', 'docx'].includes(ext)) return 'bi-file-earmark-word-fill icon-word';
    if (['xls', 'xlsx'].includes(ext)) return 'bi-file-earmark-excel-fill icon-excel';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'bi-file-earmark-image-fill icon-image';
    return 'bi-file-earmark-fill icon-default';
  }

  private descargarDocumento(url: string) {
    this.documentoError.set('');
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => window.open(URL.createObjectURL(blob), '_blank'),
      error: () => this.documentoError.set('Archivo no disponible en este entorno.'),
    });
  }

  descargarRegistroDoc(id: number) {
    this.descargarDocumento(this.guia.getDocumentoUrl(id));
  }

  descargarDocumentoEnvio(id: number) {
    this.descargarDocumento(this.guia.getDocumentoEnvioUrl(id));
  }

  verIndice(id: number, tipo: 'fisico' | 'electronico') {
    window.open(this.guia.getIndiceUrl(id, tipo), '_blank');
  }
}
