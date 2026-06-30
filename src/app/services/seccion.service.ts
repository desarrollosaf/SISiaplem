import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:3050/api/seccion';

export interface TipoSeccion {
  id: number;
  valor: string;
}

export interface DireccionItem {
  id: number;
  label: string;
}

export interface SubserieItem {
  id: number;
  codigo: string;
  subserie: string;
  idSerie: number;
  id_Departamento?: number | null;
  status: number;
}

export interface SerieItem {
  id: number;
  codigo: string;
  serie: string;
  idSeccion: number;
  departamento_id?: number | null;
  status: number;
  subSeries?: SubserieItem[];
}

export interface SeccionItem {
  id: number;
  codigo: string;
  seccion: string;
  id_subfondo: number;
  id_tipo_seccion: number;
  status: number;
  direccion_ids?: number[];
  series?: SerieItem[];
}

export interface SubfondoResumen {
  id: number;
  codigo: string;
  subfondo: string;
  id_Dependencia: number;
}

export interface SeccionSubfondoResponse {
  subfondo: SubfondoResumen;
  secciones: SeccionItem[];
}

export interface SeccionDto {
  id_subfondo: number;
  codigo: string;
  seccion: string;
  id_tipo_seccion: number;
  direccion_ids?: number[];
}

@Injectable({ providedIn: 'root' })
export class SeccionService {
  private http = inject(HttpClient);

  // ── Catálogo ──────────────────────────────────────────────────────────────

  getTipoSecciones() {
    return this.http.get<TipoSeccion[]>(`${API}/tipo-secciones`);
  }

  getDirecciones(subfondoId: number) {
    return this.http.get<DireccionItem[]>(`${API}/direcciones/${subfondoId}`);
  }

  // ── Secciones ─────────────────────────────────────────────────────────────

  getBySub(subfondoId: number) {
    return this.http.get<SeccionSubfondoResponse>(`${API}/subfondo/${subfondoId}`);
  }

  getById(id: number) {
    return this.http.get<SeccionItem>(`${API}/${id}`);
  }

  create(dto: SeccionDto) {
    return this.http.post<SeccionItem>(API, dto);
  }

  update(id: number, dto: Omit<SeccionDto, 'id_subfondo'> & { direccion_ids?: number[] }) {
    return this.http.put<SeccionItem>(`${API}/${id}`, dto);
  }

  toggleStatus(id: number) {
    return this.http.patch<{ id: number; status: number }>(`${API}/${id}/toggle`, {});
  }

  remove(id: number) {
    return this.http.delete<{ ok: boolean }>(`${API}/${id}`);
  }

  // ── Series ────────────────────────────────────────────────────────────────

  createSerie(dto: { idSeccion: number; codigo: string; serie: string; departamento_id?: number | null }) {
    return this.http.post<SerieItem>(`${API}/serie`, dto);
  }

  updateSerie(id: number, dto: { codigo: string; serie: string; departamento_id?: number | null }) {
    return this.http.put<SerieItem>(`${API}/serie/${id}`, dto);
  }

  toggleSerie(id: number) {
    return this.http.patch<{ id: number; status: number }>(`${API}/serie/${id}/toggle`, {});
  }

  removeSerie(id: number) {
    return this.http.delete<{ ok: boolean }>(`${API}/serie/${id}`);
  }

  // ── Subseries ─────────────────────────────────────────────────────────────

  createSubserie(dto: { idSerie: number; codigo: string; subserie: string; id_Departamento?: number | null }) {
    return this.http.post<SubserieItem>(`${API}/subserie`, dto);
  }

  updateSubserie(id: number, dto: { codigo: string; subserie: string; id_Departamento?: number | null }) {
    return this.http.put<SubserieItem>(`${API}/subserie/${id}`, dto);
  }

  toggleSubserie(id: number) {
    return this.http.patch<{ id: number; status: number }>(`${API}/subserie/${id}/toggle`, {});
  }

  removeSubserie(id: number) {
    return this.http.delete<{ ok: boolean }>(`${API}/subserie/${id}`);
  }
}
