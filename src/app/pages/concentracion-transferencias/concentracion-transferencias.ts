import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  TransferenciasService,
  SolicitudTransferencia,
  SolicitudDetalle,
  ExpedienteRecibido,
} from '../../services/transferencias.service';
import { GuiaService, ExpedienteDetalle } from '../../services/guia.service';
import { AuthService } from '../../services/auth.service';

type Tab = 'revisar' | 'recibir' | 'recibidas' | 'rechazadas';

@Component({
  selector: 'app-concentracion-transferencias',
  imports: [CommonModule, FormsModule, NgClass],
  templateUrl: './concentracion-transferencias.html',
  styleUrl: './concentracion-transferencias.css',
})
export class ConcentracionTransferenciasComponent implements OnInit {
  private transferenciasSvc = inject(TransferenciasService);
  private guia = inject(GuiaService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  soloExpedientes = false;
  tab = signal<Tab>('revisar');
  cargando = signal(true);

  pendientes = signal<SolicitudTransferencia[]>([]);
  autorizadas = signal<SolicitudTransferencia[]>([]);
  recibidas = signal<SolicitudTransferencia[]>([]);
  rechazadas = signal<SolicitudTransferencia[]>([]);
  expedientesRecibidos = signal<ExpedienteRecibido[]>([]);
  recibiendoId = signal<number | null>(null);

  rechazoId = signal<number | null>(null);
  motivoRechazo = '';

  autorizarId = signal<number | null>(null);
  confirmRecibirId = signal<number | null>(null);

  detalleId = signal<number | null>(null);
  detalle = signal<SolicitudDetalle | null>(null);
  cargandoDetalle = signal(false);

  // Explorador de documentos por expediente (dentro del modal de detalle)
  expedienteAbierto = signal<number | null>(null);
  expedienteDetalles = signal<Record<number, ExpedienteDetalle>>({});
  cargandoExpediente = signal<number | null>(null);
  tabExpediente = signal<Record<number, 'digital' | 'fisico'>>({});
  documentoError = signal('');

  ngOnInit() {
    this.soloExpedientes = this.route.snapshot.data['vista'] === 'expedientes';
    if (this.soloExpedientes) {
      this.cargarExpedientesRecibidos();
    } else {
      this.cargarTodo();
    }
  }

  private get rfc() {
    return this.auth.userRfc();
  }

  private cargarTodo() {
    this.cargando.set(true);
    this.transferenciasSvc.getPendientes().subscribe({
      next: (data) => { this.pendientes.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
    this.transferenciasSvc.getAutorizadas().subscribe({ next: (data) => this.autorizadas.set(data) });
    this.transferenciasSvc.getRecibidas().subscribe({ next: (data) => this.recibidas.set(data) });
    this.transferenciasSvc.getRechazadas().subscribe({ next: (data) => this.rechazadas.set(data) });
  }

  private cargarExpedientesRecibidos() {
    this.cargando.set(true);
    this.transferenciasSvc.getExpedientesRecibidos().subscribe({
      next: (data) => { this.expedientesRecibidos.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  cambiarTab(t: Tab) {
    this.tab.set(t);
  }

  pedirConfirmarAutorizar(id: number) {
    this.autorizarId.set(id);
  }

  cancelarAutorizar() {
    this.autorizarId.set(null);
  }

  confirmarAutorizar() {
    const id = this.autorizarId();
    if (id == null) return;
    this.transferenciasSvc.autorizar(id, this.rfc, true).subscribe({
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
    this.transferenciasSvc.autorizar(id, this.rfc, false, this.motivoRechazo).subscribe({
      next: () => { this.rechazoId.set(null); this.cargarTodo(); },
    });
  }

  pedirConfirmarRecibir(id: number) {
    this.confirmRecibirId.set(id);
  }

  cancelarRecibir() {
    this.confirmRecibirId.set(null);
  }

  confirmarRecibir() {
    const id = this.confirmRecibirId();
    if (id == null || this.recibiendoId() != null) return;
    this.recibiendoId.set(id);
    this.transferenciasSvc.recibir(id, this.rfc).subscribe({
      next: () => { this.recibiendoId.set(null); this.confirmRecibirId.set(null); this.cargarTodo(); },
      error: () => this.recibiendoId.set(null),
    });
  }

  actaUrl(id: number, tipo: 'revision' | 'transferencia' = 'transferencia') {
    return this.transferenciasSvc.getActaUrl(id, tipo);
  }

  verDetalle(id: number) {
    this.detalleId.set(id);
    this.detalle.set(null);
    this.cargandoDetalle.set(true);
    this.expedienteAbierto.set(null);
    this.expedienteDetalles.set({});
    this.transferenciasSvc.getDetalle(id).subscribe({
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

  estadoClase(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'status-pending';
      case 'autorizada': return 'status-transfer';
      case 'recibida': return 'status-active';
      case 'rechazada': return 'status-closed';
      default: return '';
    }
  }

  estadoLabel(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'autorizada': return 'Autorizada';
      case 'recibida': return 'Recibida';
      case 'rechazada': return 'Rechazada';
      default: return estado;
    }
  }

  // ── Explorador de documentos (idéntico a tramite/expediente/:id, solo lectura) ──

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
