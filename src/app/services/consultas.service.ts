import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

const API = `${environment.endpoint}api/consultas`;

export interface ExpedienteElegibleConsulta {
  id: number;
  nombre_ex: string;
  anio: string;
  serie_nombre: string | null;
  clasificacion: string;
}

export type EstadoSolicitudConsulta = 'pendiente' | 'rechazada' | 'autorizada';

export interface SolicitudConsulta {
  id: number;
  id_departamento: number;
  rfc_solicita: string;
  nombre_solicita: string;
  rfc_revisa: string | null;
  nombre_revisa: string | null;
  fecha_revision: string | null;
  autorizada: boolean | null;
  motivo_rechazo: string | null;
  estado: EstadoSolicitudConsulta;
  created_at: string;
}

export interface SolicitudConsultaDetalle extends SolicitudConsulta {
  expedientes: ExpedienteElegibleConsulta[];
}

@Injectable({ providedIn: 'root' })
export class ConsultasService {
  private http = inject(HttpClient);

  getElegibles(rfc: string) {
    return this.http.get<ExpedienteElegibleConsulta[]>(`${API}/elegibles`, { params: { rfc } });
  }

  crearSolicitud(rfc: string, expedienteIds: number[]) {
    return this.http.post<SolicitudConsultaDetalle>(API, { rfc, expedienteIds });
  }

  getPendientes() {
    return this.http.get<SolicitudConsulta[]>(`${API}/pendientes`);
  }

  getMisSolicitudes(rfc: string) {
    return this.http.get<SolicitudConsulta[]>(`${API}/mias`, { params: { rfc } });
  }

  getAutorizadas() {
    return this.http.get<SolicitudConsulta[]>(`${API}/autorizadas`);
  }

  getRechazadas() {
    return this.http.get<SolicitudConsulta[]>(`${API}/rechazadas`);
  }

  getDetalle(id: number) {
    return this.http.get<SolicitudConsultaDetalle>(`${API}/${id}`);
  }

  autorizar(id: number, rfc: string, autoriza: boolean, motivo?: string) {
    return this.http.patch<SolicitudConsultaDetalle>(`${API}/${id}/autorizar`, { rfc, autoriza, motivo });
  }
}
