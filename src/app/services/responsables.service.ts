import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

const API = `${environment.endpoint}api/responsables`;

export interface ResponsableItem {
  id: number;
  tipo_id: number;
  tipo_nombre: string;
  rfc_responsable: string;
  nombre_responsable: string;
  id_Departamento: number;
  nombre_departamento: string;
  id_Dependencia: number;
  nombre_dependencia: string;
  email: string;
  tel: string;
  ext: string;
  id_edificio: number;
  nombre_edificio: string;
  status: boolean;
}

export interface TipoUsuario {
  id: number;
  tipo: string;
}

export interface Dependencia {
  id_Dependencia: number;
  nombre_completo: string;
}

export interface Departamento {
  id_Departamento: number;
  nombre_completo: string;
}

export interface Usuario {
  rfc: string;
  nombre: string;
}

export interface Edificio {
  id_Direccion: number;
  nombre_completo: string;
}

export interface ResponsableDto {
  tipo_id: number;
  rfc_responsable: string;
  id_Departamento: number;
  email?: string;
  tel?: string;
  ext?: string;
  id_edificio?: number;
}

@Injectable({ providedIn: 'root' })
export class ResponsablesService {
  private http = inject(HttpClient);

  getAll()          { return this.http.get<ResponsableItem[]>(API); }
  getTiposUsuario() { return this.http.get<TipoUsuario[]>(`${API}/tipos-usuario`); }
  getDependencias() { return this.http.get<Dependencia[]>(`${API}/dependencias`); }
  getEdificios()    { return this.http.get<Edificio[]>(`${API}/edificios`); }

  getDepartamentos(id_Dependencia: number) {
    return this.http.get<Departamento[]>(`${API}/departamentos`, {
      params: { id_Dependencia: String(id_Dependencia) },
    });
  }

  getUsuarios(id_Departamento: number) {
    return this.http.get<Usuario[]>(`${API}/usuarios`, {
      params: { id_Departamento: String(id_Departamento) },
    });
  }

  create(dto: ResponsableDto)              { return this.http.post<ResponsableItem>(API, dto); }
  update(id: number, dto: ResponsableDto)  { return this.http.put<ResponsableItem>(`${API}/${id}`, dto); }
  remove(id: number)                       { return this.http.delete<{ ok: boolean }>(`${API}/${id}`); }
  toggleStatus(id: number)                 { return this.http.put<{ ok: boolean }>(`${API}/${id}/toggle-status`, {}); }
}
