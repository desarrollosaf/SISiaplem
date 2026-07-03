import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:3050/api/cadido';

export interface CadidoInt {
  id: number;
  codigo: string;
  subfondo: string;
  nombre_completo: string;
}

export interface detalle {
  id: number;
  codigoS: string;
  seccion: string;
  codigoSe: string;
  serie: string;
  codigoSub: string;
  subserie: string;
  valores: string;
  at: number;
  ac: number;
  destino: string;
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
}
