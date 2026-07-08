import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

const API = `${environment.endpoint}api/transferencias`;

export interface ExpedienteElegible {
  id: number;
  nombre_ex: string;
  anio: string;
  fecha_cierre_exp: string | null;
  serie_nombre: string | null;
  clasificacion: string;
}

export type EstadoSolicitud = 'pendiente' | 'rechazada' | 'autorizada' | 'recibida';

export interface SolicitudTransferencia {
  id: number;
  id_departamento: number;
  rfc_solicita: string;
  nombre_solicita: string;
  rfc_revisa: string | null;
  nombre_revisa: string | null;
  fecha_revision: string | null;
  autorizada: boolean | null;
  motivo_rechazo: string | null;
  rfc_recibe: string | null;
  nombre_recibe: string | null;
  fecha_recepcion: string | null;
  estado: EstadoSolicitud;
  created_at: string;
}

export interface SolicitudDetalle extends SolicitudTransferencia {
  expedientes: ExpedienteElegible[];
}

export interface ExpedienteRecibido {
  id: number;
  nombre_ex: string;
  anio: string;
  serie_nombre: string | null;
  clasificacion: string;
  id_solicitud_transferencia: number;
  fecha_recepcion: string | null;
}

@Injectable({ providedIn: 'root' })
export class TransferenciasService {
  private http = inject(HttpClient);

  getElegibles(rfc: string) {
    return this.http.get<ExpedienteElegible[]>(`${API}/elegibles`, { params: { rfc } });
  }

  crearSolicitud(rfc: string, expedienteIds: number[]) {
    return this.http.post<SolicitudDetalle>(API, { rfc, expedienteIds });
  }

  getPendientes() {
    return this.http.get<SolicitudTransferencia[]>(`${API}/pendientes`);
  }

  getMisSolicitudes(rfc: string) {
    return this.http.get<SolicitudTransferencia[]>(`${API}/mias`, { params: { rfc } });
  }

  getAutorizadas() {
    return this.http.get<SolicitudTransferencia[]>(`${API}/autorizadas`);
  }

  getRechazadas() {
    return this.http.get<SolicitudTransferencia[]>(`${API}/rechazadas`);
  }

  getRecibidas() {
    return this.http.get<SolicitudTransferencia[]>(`${API}/recibidas`);
  }

  getExpedientesRecibidos() {
    return this.http.get<ExpedienteRecibido[]>(`${API}/expedientes-recibidos`);
  }

  getDetalle(id: number) {
    return this.http.get<SolicitudDetalle>(`${API}/${id}`);
  }

  autorizar(id: number, rfc: string, autoriza: boolean, motivo?: string) {
    return this.http.patch<SolicitudDetalle>(`${API}/${id}/autorizar`, { rfc, autoriza, motivo });
  }

  recibir(id: number, rfc: string) {
    return this.http.patch<SolicitudDetalle>(`${API}/${id}/recibir`, { rfc });
  }

  getActaUrl(id: number, tipo: 'revision' | 'transferencia'): string {
    return `${API}/${id}/acta?tipo=${tipo}`;
  }
}
