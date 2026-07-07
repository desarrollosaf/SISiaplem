import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:3050/api/clasificacion';


export interface clasificacion{
    id_serie: number | null, 
    serie: string,
    id_subserie: number | null, 
    subserie: string,
}

@Injectable()
export class ClasificacionService {
    private http = inject(HttpClient);

    getclasificacion() {
        return this.http.get<clasificacion[]>(`${API}`);
    }
}
