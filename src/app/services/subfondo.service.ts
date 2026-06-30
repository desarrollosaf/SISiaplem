import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:3050/api/subfondo';

export interface SubfondoItem {
  id: number;
  codigo: string;
  subfondo: string;
  id_Dependencia: number;
  nombre_dependencia: string;
  total_secciones: number;
  total_series: number;
  total_subseries: number;
}

export interface Dependencia {
  id_Dependencia: number;
  nombre_completo: string;
}

export interface SubfondoDto {
  codigo: string;
  subfondo: string;
  id_Dependencia: number;
}

export interface SubserieDetalle {
  id: number;
  codigo: string;
  subserie: string;
}

export interface SerieDetalle {
  id: number;
  codigo: string;
  serie: string;
  subseries: SubserieDetalle[];
}

export interface SeccionDetalle {
  id: number;
  codigo: string;
  seccion: string;
  series: SerieDetalle[];
}

export interface SubfondoDetalle extends SubfondoItem {
  secciones: SeccionDetalle[];
}

@Injectable({ providedIn: 'root' })
export class SubfondoService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<SubfondoItem[]>(API);
  }

  getById(id: number) {
    return this.http.get<SubfondoDetalle>(`${API}/${id}`);
  }

  getDependencias() {
    return this.http.get<Dependencia[]>(`${API}/dependencias`);
  }

  create(dto: SubfondoDto) {
    return this.http.post<SubfondoItem>(API, dto);
  }

  update(id: number, dto: SubfondoDto) {
    return this.http.put<SubfondoItem>(`${API}/${id}`, dto);
  }

  remove(id: number) {
    return this.http.delete<{ ok: boolean }>(`${API}/${id}`);
  }

  getCuadroUrl() {
    return this.http.get<{ url: string }>(`${API}/cuadro`);
  }
}
