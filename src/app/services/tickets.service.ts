import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

const API = `${environment.endpoint}api/tickets`;

export type TipoProcedimiento =
  | 'directorio_responsables'
  | 'asesoria_tecnica'
  | 'baja_documental'
  | 'transferencia_primaria'
  | 'prestamo_consulta';

export interface TicketResponsable {
  id: number;
  tipo_procedimiento: string | null;
  rfc_responsable: string;
  nombre_responsable: string | null;
  activo: boolean;
  created_at: string;
}

export interface ResponsablePayload {
  tipo_procedimiento?: string | null;
  rfc_responsable: string;
  nombre_responsable?: string;
}

export interface AutorizarTitularPayload {
  firmado: boolean;
  rfc_titular: string;
  password_firma?: string;
  rfc_actor: string;
  rol_actor?: string;
  comentario?: string;
  es_admin?: boolean;
}

export interface TicketHistorialItem {
  id: number;
  rfc_actor: string | null;
  rol_actor: string | null;
  accion: string;
  estado_resultante: string | null;
  created_at: string;
}

export interface TicketDirectorioDetalle {
  subtipo: string | null;
  nombre_completo_entrante: string | null;
  cargo_puesto: string | null;
  correo_institucional: string | null;
  telefono_extension: string | null;
  ruta_oficio_designacion: string | null;
}

export interface TicketBajaDetalle {
  dictamen_procedencia: string | null;
  programacion_traslado: string | null;
}

export interface TicketTransferenciaDetalle {
  id_solicitud_transferencia: number | null;
}

export interface TicketPrestamoDetalle {
  id_solicitud_consulta: number | null;
  tipo_solicitud: string | null;
  persona_habilitada: string | null;
}

export interface Ticket {
  id: number;
  folio: string;
  tipo_procedimiento: TipoProcedimiento;
  asunto: string;
  categoria: string | null;
  descripcion: string | null;
  id_dependencia: number | null;
  id_unidad_administrativa: number | null;
  rfc_solicitante: string | null;
  rfc_titular: string | null;
  nombre_solicitante: string | null;
  correo_solicitante: string | null;
  extension_solicitante: string | null;
  numero_oficio_turno: string | null;
  estado: string;
  rfc_asignado: string | null;
  fecha_programada: string | null;
  modalidad_lugar: string | null;
  ruta_acta: string | null;
  comentarios_cierre: string | null;
  created_at: string;
  updated_at: string;
  directorioDetalle?: TicketDirectorioDetalle | null;
  bajaDetalle?: TicketBajaDetalle | null;
  transferenciaDetalle?: TicketTransferenciaDetalle | null;
  prestamoDetalle?: TicketPrestamoDetalle | null;
  historial?: TicketHistorialItem[];
}

export interface CrearTicketPayload {
  tipo_procedimiento: TipoProcedimiento;
  asunto: string;
  categoria?: string;
  descripcion?: string;
  rfc_solicitante?: string;
  nombre_solicitante?: string;
  correo_solicitante?: string;
  extension_solicitante?: string;
  numero_oficio_turno?: string;
  rfc_actor: string;
  rol_actor?: string;
  subtipo?: string;
  nombre_completo_entrante?: string;
  cargo_puesto?: string;
  correo_institucional?: string;
  telefono_extension?: string;
  ruta_oficio_designacion?: string;
  id_solicitud_transferencia?: number;
  id_solicitud_consulta?: number;
  tipo_solicitud_prestamo?: string;
  persona_habilitada?: string;
}

export interface AsignarTicketPayload {
  rfc_asignado: string;
  fecha_programada?: string;
  modalidad_lugar?: string;
  rfc_actor: string;
  rol_actor?: string;
}

export interface CambiarEstadoPayload {
  estado: string;
  rfc_actor: string;
  rol_actor?: string;
  comentario?: string;
}

export interface CerrarTicketPayload {
  ruta_acta?: string;
  comentarios_cierre?: string;
  rfc_actor: string;
  rol_actor?: string;
  dictamen_procedencia?: string;
  programacion_traslado?: string;
}

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private http = inject(HttpClient);

  crear(dto: CrearTicketPayload) {
    return this.http.post<Ticket>(API, dto);
  }

  listar(
    filtros: {
      tipo_procedimiento?: string;
      estado?: string;
      rfc_solicitante?: string;
      rfc_usuario?: string;
      es_admin?: boolean;
    } = {},
  ) {
    const params: Record<string, string> = {};
    if (filtros.tipo_procedimiento) params['tipo_procedimiento'] = filtros.tipo_procedimiento;
    if (filtros.estado) params['estado'] = filtros.estado;
    if (filtros.rfc_solicitante) params['rfc_solicitante'] = filtros.rfc_solicitante;
    if (filtros.rfc_usuario) params['rfc_usuario'] = filtros.rfc_usuario;
    if (filtros.es_admin !== undefined) params['es_admin'] = String(filtros.es_admin);
    return this.http.get<Ticket[]>(API, { params });
  }

  obtener(id: number) {
    return this.http.get<Ticket>(`${API}/${id}`);
  }

  asignar(id: number, dto: AsignarTicketPayload) {
    return this.http.patch<Ticket>(`${API}/${id}/asignar`, dto);
  }

  autorizarTitular(id: number, dto: AutorizarTitularPayload) {
    return this.http.patch<Ticket>(`${API}/${id}/autorizar-titular`, dto);
  }

  cambiarEstado(id: number, dto: CambiarEstadoPayload) {
    return this.http.patch<Ticket>(`${API}/${id}/estado`, dto);
  }

  cerrar(id: number, dto: CerrarTicketPayload) {
    return this.http.patch<Ticket>(`${API}/${id}/cerrar`, dto);
  }

  listarResponsables() {
    return this.http.get<TicketResponsable[]>(`${API}/responsables`);
  }

  crearResponsable(dto: ResponsablePayload) {
    return this.http.post<TicketResponsable>(`${API}/responsables`, dto);
  }

  actualizarResponsable(id: number, dto: ResponsablePayload) {
    return this.http.patch<TicketResponsable>(`${API}/responsables/${id}`, dto);
  }

  toggleResponsable(id: number) {
    return this.http.patch<TicketResponsable>(`${API}/responsables/${id}/toggle`, {});
  }
}
