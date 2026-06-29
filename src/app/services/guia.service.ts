import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:3050/api/guia';

export interface Subserie {
  id: number;
  codigo: string;
  subserie: string;
  total_expedientes: number;
}

export interface Serie {
  id: number;
  codigo: string;
  serie: string;
  total_expedientes: number;
  subseries: Subserie[];
}

export interface Expediente {
  id: number;
  nombre_ex: string;
  anio: string;
  fecha_cierre_exp: string | null;
  status: number;
  created_at: string;
  serie_codigo?: string;
  serie_nombre?: string;
  subserie_codigo?: string;
  subserie_nombre?: string;
}

@Injectable({ providedIn: 'root' })
export class GuiaService {
  private http = inject(HttpClient);

  getInventario(rfc: string) {
    return this.http.get<Serie[]>(`${API}/inventario`, { params: { rfc } });
  }

  getSerie(id: number) {
    return this.http.get<{ id: number; codigo: string; serie: string }>(`${API}/serie/${id}`);
  }

  getSubserie(id: number) {
    return this.http.get<{ id: number; codigo: string; subserie: string; serie_codigo: string; serie_nombre: string }>(`${API}/subserie/${id}`);
  }

  getExpedientesSerie(id: number) {
    return this.http.get<Expediente[]>(`${API}/expedientes/serie/${id}`);
  }

  getExpedientesSubserie(id: number) {
    return this.http.get<Expediente[]>(`${API}/expedientes/subserie/${id}`);
  }

  getActivos(rfc: string) {
    return this.http.get<Expediente[]>(`${API}/activos`, { params: { rfc } });
  }

  getCerrados(rfc: string) {
    return this.http.get<Expediente[]>(`${API}/cerrados`, { params: { rfc } });
  }

  crearExpediente(data: { id_serie?: number; id_subserie?: number; nombre_ex: string; anio: string }) {
    return this.http.post<Expediente>(`${API}/expedientes`, data);
  }

  cerrarExpediente(id: number) {
    return this.http.patch<{ ok: boolean }>(`${API}/expedientes/${id}/cerrar`, {});
  }
}
