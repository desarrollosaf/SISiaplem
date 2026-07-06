import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

const API = `${environment.endpoint}api/avisos`;

export interface Aviso {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: 'info' | 'curso' | 'evento' | 'urgente';
  pdf_path: string | null;
  activo: number;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class AvisosService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<Aviso[]>(API);
  }

  getRecientes(limit = 5) {
    return this.http.get<Aviso[]>(`${API}/recientes`, { params: { limit } });
  }

  create(data: FormData) {
    return this.http.post<Aviso>(API, data);
  }

  update(id: number, data: FormData) {
    return this.http.patch<Aviso>(`${API}/${id}`, data);
  }

  toggleActivo(id: number) {
    return this.http.patch<Aviso>(`${API}/${id}/toggle`, {});
  }

  delete(id: number) {
    return this.http.delete<{ ok: boolean }>(`${API}/${id}`);
  }

  pdfUrl(path: string) {
    return `${environment.endpoint}uploads/${path}`;
  }
}
