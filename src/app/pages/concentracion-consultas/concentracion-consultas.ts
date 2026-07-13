import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ConsultasService,
  SolicitudConsulta,
  SolicitudConsultaDetalle,
} from '../../services/consultas.service';
import { AuthService } from '../../services/auth.service';

type Tab = 'revisar' | 'autorizadas' | 'rechazadas';

@Component({
  selector: 'app-concentracion-consultas',
  imports: [CommonModule, FormsModule],
  templateUrl: './concentracion-consultas.html',
  styleUrl: './concentracion-consultas.css',
})
export class ConcentracionConsultasComponent implements OnInit {
  private consultasSvc = inject(ConsultasService);
  protected auth = inject(AuthService);

  tab = signal<Tab>('revisar');
  cargando = signal(true);

  pendientes = signal<SolicitudConsulta[]>([]);
  autorizadas = signal<SolicitudConsulta[]>([]);
  rechazadas = signal<SolicitudConsulta[]>([]);

  rechazoId = signal<number | null>(null);
  motivoRechazo = '';
  autorizarId = signal<number | null>(null);

  detalleId = signal<number | null>(null);
  detalle = signal<SolicitudConsultaDetalle | null>(null);
  cargandoDetalle = signal(false);

  ngOnInit() {
    this.tab.set(this.auth.hasPermission('transferencias.revisar') ? 'revisar' : 'autorizadas');
    this.cargarTodo();
  }

  private get rfc() {
    return this.auth.userRfc();
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
    this.autorizarId.set(id);
  }

  cancelarAutorizar() {
    this.autorizarId.set(null);
  }

  confirmarAutorizar() {
    const id = this.autorizarId();
    if (id == null) return;
    this.consultasSvc.autorizar(id, this.rfc, true).subscribe({
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
    this.consultasSvc.getDetalle(id).subscribe({
      next: (data) => { this.detalle.set(data); this.cargandoDetalle.set(false); },
      error: () => this.cargandoDetalle.set(false),
    });
  }

  cerrarDetalle() {
    this.detalleId.set(null);
    this.detalle.set(null);
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
}
