import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

const API = `${environment.endpoint}api/ficha-valoracion`;

export interface TipoDoc {
  id: number;
  tipo_doc: string;
  status: number;
}

@Injectable({ providedIn: 'root' })
export class FichaValoracionService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<TipoDoc[]>(API);
  }

  create(dto: { tipo_doc: string }) {
    return this.http.post<TipoDoc>(API, dto);
  }

  update(id: number, dto: { tipo_doc: string }) {
    return this.http.put<TipoDoc>(`${API}/${id}`, dto);
  }

  toggleStatus(id: number) {
    return this.http.patch<{ id: number; status: number }>(`${API}/${id}/toggle`, {});
  }
}
