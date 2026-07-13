import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  ConsultasService,
  ExpedienteElegibleConsulta,
  SolicitudConsulta,
  SolicitudConsultaDetalle,
} from '../../services/consultas.service';
import { GuiaService, ExpedienteDetalle } from '../../services/guia.service';
import { AuthService } from '../../services/auth.service';

type Tab = 'nueva' | 'mias';

@Component({
  selector: 'app-tramite-consulta-expedientes',
  imports: [CommonModule, FormsModule, NgClass],
  templateUrl: './tramite-consulta-expedientes.html',
  styleUrl: './tramite-consulta-expedientes.css',
})
export class TramiteConsultaExpedientesComponent implements OnInit {
  private consultasSvc = inject(ConsultasService);
  private guia = inject(GuiaService);
  private auth = inject(AuthService);
  private http = inject(HttpClient);

  tab = signal<Tab>('nueva');
  cargando = signal(true);

  elegibles = signal<ExpedienteElegibleConsulta[]>([]);
  seleccionados = signal<Set<number>>(new Set());
  enviando = signal(false);

  misSolicitudes = signal<SolicitudConsulta[]>([]);

  confirmSolicitarOpen = signal(false);

  // ── Modal de detalle / consulta de documentos ──
  detalleId = signal<number | null>(null);
  detalle = signal<SolicitudConsultaDetalle | null>(null);
  cargandoDetalle = signal(false);

  expedienteAbierto = signal<number | null>(null);
  expedienteDetalles = signal<Record<number, ExpedienteDetalle>>({});
  cargandoExpediente = signal<number | null>(null);
  tabExpediente = signal<Record<number, 'digital' | 'fisico'>>({});
  documentoError = signal('');

  ngOnInit() {
    this.cargarTodo();
  }

  private get rfc() {
    return this.auth.userRfc();
  }

  private cargarTodo() {
    this.cargando.set(true);
    this.consultasSvc.getElegibles(this.rfc).subscribe({
      next: (data) => { this.elegibles.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
    this.consultasSvc.getMisSolicitudes(this.rfc).subscribe({ next: (data) => this.misSolicitudes.set(data) });
  }

  cambiarTab(t: Tab) {
    this.tab.set(t);
  }

  estaSeleccionado(id: number): boolean {
    return this.seleccionados().has(id);
  }

  toggleSeleccion(id: number) {
    this.seleccionados.update((set) => {
      const nuevo = new Set(set);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
  }

  pedirConfirmarSolicitud() {
    if (!this.seleccionados().size || this.enviando()) return;
    this.confirmSolicitarOpen.set(true);
  }

  cancelarSolicitud() {
    this.confirmSolicitarOpen.set(false);
  }

  confirmarSolicitud() {
    const ids = [...this.seleccionados()];
    if (!ids.length || this.enviando()) return;
    this.enviando.set(true);
    this.consultasSvc.crearSolicitud(this.rfc, ids).subscribe({
      next: () => {
        this.enviando.set(false);
        this.confirmSolicitarOpen.set(false);
        this.seleccionados.set(new Set());
        this.cargarTodo();
        this.tab.set('mias');
      },
      error: () => { this.enviando.set(false); this.confirmSolicitarOpen.set(false); },
    });
  }

  estadoClase(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'status-pending';
      case 'autorizada': return 'status-active';
      case 'rechazada': return 'status-closed';
      default: return '';
    }
  }

  estadoLabel(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'autorizada': return 'Autorizada';
      case 'rechazada': return 'Rechazada';
      default: return estado;
    }
  }

  // ── Modal de detalle / consulta de documentos ──

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
