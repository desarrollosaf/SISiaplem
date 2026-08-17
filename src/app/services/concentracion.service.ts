import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

const API = `${environment.endpoint}api/concentracion`;

@Injectable({ providedIn: 'root' })
export class ConcentracionService {
  getBajaDocumentalUrl(rfc: string): string {
    return `${API}/baja-documental/pdf?rfc=${encodeURIComponent(rfc)}`;
  }

  getInventarioGeneralUrl(rfc: string): string {
    return `${API}/inventario-general/pdf?rfc=${encodeURIComponent(rfc)}`;
  }

  getTransferenciaSecundariaUrl(rfc: string): string {
    return `${API}/transferencia-secundaria/pdf?rfc=${encodeURIComponent(rfc)}`;
  }

  getCalendarioCaducidadesUrl(rfc: string): string {
    return `${API}/calendario-caducidades/pdf?rfc=${encodeURIComponent(rfc)}`;
  }
}
