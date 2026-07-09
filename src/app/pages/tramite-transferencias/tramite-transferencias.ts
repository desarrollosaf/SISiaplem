import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TransferenciasService,
  ExpedienteElegible,
  SolicitudTransferencia,
} from '../../services/transferencias.service';
import { AuthService } from '../../services/auth.service';

type Tab = 'nueva' | 'mias';

@Component({
  selector: 'app-tramite-transferencias',
  imports: [CommonModule, FormsModule],
  templateUrl: './tramite-transferencias.html',
  styleUrl: './tramite-transferencias.css',
})
export class TramiteTransferenciasComponent implements OnInit {
  private transferenciasSvc = inject(TransferenciasService);
  private auth = inject(AuthService);

  tab = signal<Tab>('nueva');
  cargando = signal(true);

  elegibles = signal<ExpedienteElegible[]>([]);
  seleccionados = signal<Set<number>>(new Set());
  enviando = signal(false);

  misSolicitudes = signal<SolicitudTransferencia[]>([]);

  confirmSolicitarOpen = signal(false);

  ngOnInit() {
    this.cargarTodo();
  }

  private get rfc() {
    return this.auth.userRfc();
  }

  private cargarTodo() {
    this.cargando.set(true);
    this.transferenciasSvc.getElegibles(this.rfc).subscribe({
      next: (data) => { this.elegibles.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
    this.transferenciasSvc.getMisSolicitudes(this.rfc).subscribe({ next: (data) => this.misSolicitudes.set(data) });
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
    this.transferenciasSvc.crearSolicitud(this.rfc, ids).subscribe({
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

  actaUrl(id: number) {
    return this.transferenciasSvc.getActaUrl(id, 'revision');
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
}
