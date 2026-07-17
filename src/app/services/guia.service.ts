import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

const API = `${environment.endpoint}api/guia`;

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
  departamento_id: number | null;
  departamento_nombre: string | null;
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

export interface ActividadReciente {
  id: string;
  codigo: string;
  nombre_ex: string;
  area: string;
  estado: string;
  fecha: string;
}

export interface TipoTratamiento {
  id: number;
  tipo: string;
  status: boolean;
}

export interface ServidorPublico {
  N_Usuario: string;
  Nombre: string;
}

export interface DocumentoFisico {
  id: number;
  folio: string;
  titulo_doc: string;
  status: boolean;
}

export interface TipoDoc {
  id: number;
  tipo_doc: string;
}

export interface DocumentoEnvio {
  id: number;
  path: string | null;
  status_doc: boolean;
  tipo: TipoDoc | null;
}

export interface DocumentoDigital {
  id: number;
  folio: string;
  titulo_doc: string;
  path: string | null;
  status: boolean;
  docs: DocumentoEnvio[];
}

export interface RegistroDoc {
  id: number;
  folio: string | null;
  titulo_doc: string | null;
  path_doc: string | null;
  status: boolean;
  tipo: TipoDoc | null;
}

export interface ExpedienteDetalle {
  expediente: {
    id: number;
    nombre_ex: string;
    anio: string;
    fecha_cierre_exp: string | null;
    fecha_transferencia: string | null;
    status: number;
    id_serie: number | null;
    id_subserie: number | null;
    id_tipo_expediente: number | null;
    rfc_usuario_expediente: string | null;
    serie_codigo: string | null;
    serie_nombre: string | null;
    subserie_codigo: string | null;
    subserie_nombre: string | null;
  };
  tipoExpediente: TipoTratamiento | null;
  responsable: ServidorPublico | null;
  fisicos: DocumentoFisico[];
  digitales: DocumentoDigital[];
  registrosDocs: RegistroDoc[];
}

export interface CrearExpedienteDto {
  id_serie?: number;
  id_subserie?: number;
  nombre_ex: string;
  anio: string;
  id_tipo_expediente?: number;
  rfc_usuario_expediente?: string;
}

export interface TransferirExpedienteDto {
  nombre_ex?: string;
  anio?: string;
  id_tipo_expediente?: number | null;
  rfc_usuario_expediente?: string | null;
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

  getActividadReciente(rfc: string, limit = 5) {
    return this.http.get<ActividadReciente[]>(`${API}/actividad-reciente`, { params: { rfc, limit } });
  }

  crearExpediente(data: CrearExpedienteDto) {
    return this.http.post<Expediente>(`${API}/expedientes`, data);
  }

  cerrarExpediente(id: number) {
    return this.http.patch<{ ok: boolean }>(`${API}/expedientes/${id}/cerrar`, {});
  }

  getTiposTratamiento() {
    return this.http.get<TipoTratamiento[]>(`${API}/tipos-tratamiento`);
  }

  getServidoresPublicos() {
    return this.http.get<ServidorPublico[]>(`${API}/servidores-publicos`);
  }

  getExpedienteDetalle(id: number) {
    return this.http.get<ExpedienteDetalle>(`${API}/expedientes/${id}`);
  }

  transferirExpediente(id: number, data: TransferirExpedienteDto) {
    return this.http.put<ExpedienteDetalle>(`${API}/expedientes/${id}`, data);
  }

  getDocumentoUrl(id: number): string {
    return `${API}/documento/${id}`;
  }

  getDocumentoRegistroUrl(id: number): string {
    return `${API}/documento-registro/${id}`;
  }

  getDocumentoEnvioUrl(id: number): string {
    return `${API}/documento-envio/${id}`;
  }

  getIndiceUrl(id: number, tipo: 'fisico' | 'electronico'): string {
    return `${API}/expedientes/${id}/indice/${tipo}`;
  }
}
