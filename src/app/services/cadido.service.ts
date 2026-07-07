import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API = `${environment.endpoint}api/cadido`;

export interface CadidoInt {
  id: number;
  codigo: string;
  subfondo: string;
  nombre_completo: string;
}

export interface detalle {
  id: number;
  codigo: string;
  seccion: string;
  series: serieI[];
}

export interface serieI {
  id: number,
  codigo: string,
  serie: string,
  subserie: string | null,
  subSeries: subseriesI[]
  anio_tramite: number,
  anios_consentracion: number
  total_anios: number, 
  valores: valoresI[],
  destino: DestinoI,
  id_destino: number,
}

export interface FormSerie {
  codigo: string;
  serie: string;
  subserie: string | null;
  anio_tramite: number;
  anios_consentracion: number;
  total_anios: number;
  valoresSeleccionados: number[];
  destino: DestinoI | null;
  id_destino: number,
}

export interface resultado {
  series: serieI, 
  valoresS: [],
  destinosS: []
}

export interface subseriesI{
  id: number,
  codigo: string,
  subserie: string,
  anio_tramite: number,
  anios_consentracion: number
  total_anios: number,
  valores: valoresI[],
  destino: DestinoI,
  id_destino: number
}

export interface DestinoI {
  id: number;
  valor: string;
}

export interface valoresI{
  id_valor: number,
}

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

@Injectable({ providedIn: 'root' })
export class CadidoSevice {
  private http = inject(HttpClient);

  getsubfondos() {
    return this.http.get<CadidoInt[]>(`${API}/getsubfondos`);
  }

  getcadido(id: number){
    return this.http.get<detalle[]>(`${API}/${id}`);
  }

  getserie(id:number, tipo: number){
    return this.http.get<resultado>(`${API}/getserie/${id}/${tipo}`);
  }

  update(id: number, dto: Omit<FormSerie, 'id_subfondo'> & { direccion_ids?: number[] }) {
    return this.http.put<serieI>(`${API}/${id}`, dto);
  }  
}
