import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:3050/api/cadido';

export interface CadidoInt {
  id: number;
  codigo: string;
  subfondo: string;
  dependencia: string;
}

@Injectable({ providedIn: 'root' })
export class CadidoSevice {
  private http = inject(HttpClient);

  getsubfondos() {
    return this.http.get<CadidoInt[]>(`${API}/getsubfondos`);
  }

}
