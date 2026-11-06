import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { serieI, subseriesI } from './cadido.service';
import { Departamento } from './responsables.service';
import { SeccionDetalle } from './subfondo.service';
import { Solicitudes } from '../pages/solicitudes/solicitudes';

const API = `${environment.endpoint}api/clasificacion`;


export interface clasificacion{
    series: serieI[],
    subseries: subseriesI[],
}

export interface solicitud{
    id: number, 
    tipoTramite: tipoTramiteI,
    tipoMov: number,
    tipo: number,
    codigo: string, 
    adicion:string,
    serieM: serieI, 
    subserieM: subseriesI, 
    motivo: string, 
    created_at: Date, 
    statusSolicitud: estatusI,
    motivo_rechazo: string
}

export interface tipoTramiteI{
    id: number, 
    tipo: string
}

export interface tipoTramiteMovI{
    id: number, 
    tipo: string
}

export interface estatusI{
    id: number, 
    status: string
}

export interface seccionI{
    id: number,
    codigo: string, 
    seccion: string
}

export interface FormSolicitud {
    id: number,
    tipo: number | null, 
    id_departamento: number | null, 
    tipoMov: number | null,
    idSeccion: number | null, 
    codigo: string | null, 
    adicion: string | null, 
    motivo: string | null,
    id_serie: number | null,
    id_subserie: number | null
}

export interface formSolicitudD{
    id: number, 
    unidad: string, 
    solicitante: string, 
    tipo: string, 
    clasificacion: string, 
    seccion: string | null,
    cancelar: string | null, 
    codigo: string | null, 
    adicion: string | null, 
    motivo: string,
    status: number,
    motivo_rechazo: string | null
}

export interface solicitudesI {
    id: number, 
    rfc_solicituda: string, 
    seccion: seccionI[],
    id_departamento: number, 
    tipo: number,
    tipoI: tipoTramiteI[],
    tipoMov: number,
    tipoTramite: tipoTramiteMovI,
    motivo: string, 
    codigo: string, 
    adicion: string, 
    serieM: serieI, 
    subserieM: subseriesI,
    statusSolicitud: estatusI,
    created_at: Date
}

export interface solicitudesAd {
    id: number , 
    solicitante: string, 
    seccion: seccionI,
    unidad: string, 
    movimiento: tipoTramiteI,
    tipoTramite: tipoTramiteMovI,
    motivo: string, 
    codigo: string, 
    adicion: string, 
    serieM: serieI, 
    subserieM: subseriesI,
    statusSolicitud: estatusI,
    motivo_rechazo: string,
    created_at: Date
}

export interface respuetaI{
    solicitud: solicitudesAd,
    solicitante: responsableI
}

export interface responsableI{
    rfc: string,
    Nombre: string, 
    departamentoM: departamentoI,
}

export interface departamentoI{
    id_Departamento: number, 
    nombre_completo: string
}

@Injectable({ providedIn: 'root' })
export class ClasificacionService {
    private http = inject(HttpClient);

    getclasificacion() {
        return this.http.get<clasificacion>(`${API}`);
    }

    getsolicitudes() {
        return this.http.get<solicitud[]>(`${API}/getsolicitudes`);
    }

    getTipo(){
        return this.http.get<tipoTramiteI[]>(`${API}/getTipo`);
    }

    getDeptos(){
        return this.http.get<Departamento[]>(`${API}/getDeptos`);
    }

    gettipotramitemov(){
        return this.http.get<tipoTramiteI[]>(`${API}/gettipotramitemov`);
    }

    getseccion(){
        return this.http.get<seccionI[]>(`${API}/getseccion`);
    }

    getseries(){
        return this.http.get<serieI[]>(`${API}/getseries`);
    }

    getsubseries(){
        return this.http.get<subseriesI[]>(`${API}/getsubseries`);
    }

    saveSolicitud(dto: FormSolicitud) {
        return this.http.post<FormSolicitud>(`${API}/saveSolicitud`, dto);
    }  

    getSolicitudesAdmin(){
        return this.http.get<solicitudesI[]>(`${API}/getSolicitudesAdmin`);
    }

    getsolicitud(id: number){
        return this.http.get<respuetaI>(`${API}/getSolicitud/${id}`);
    }

    getstatus(){
        return this.http.get<[]>(`${API}/getstatus`);
    }

    editSolicitud(dto: formSolicitudD){
        return this.http.post<formSolicitudD>(`${API}/editSolicitud`, dto);
    }
}
