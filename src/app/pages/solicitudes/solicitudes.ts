import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClasificacionService, FormSolicitud, formSolicitudD, respuetaI, solicitudesI } from '../../services/clasificacion.service';
import { Solicitud } from '../clasificacion/solicitud/solicitud';


type DrawerMode = 'solicitud-new' | 'solicitud-edit';
@Component({
  selector: 'app-solicitudes',
  imports: [
    FormsModule
  ],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.css',
})
export class Solicitudes {
    cargando = signal(true);
    error = signal('');
    solicitudes = signal<solicitudesI[]>([]);
    drawerOpen = signal(false);
    drawerMode = signal<DrawerMode>('solicitud-edit');
    guardando = signal(false);
    cargandoSolicitud = signal(false);
    solicitudContextId = signal<number | null>(null);

    formSolicitud: FormSolicitud ={ 
      id: 0,
      tipo: null, 
      id_departamento: null, 
      tipoMov: null,
      idSeccion: null, 
      codigo: null, 
      adicion: null, 
      motivo: null,
      id_serie: null,
      id_subserie:null
    };

    formSolicitudD: formSolicitudD = {
      id: 0, 
      unidad: '', 
      solicitante: '', 
      tipo: '',
      clasificacion: '', 
      seccion: '', 
      codigo: '', 
      adicion: '', 
      cancelar: '', 
      motivo: '',
      status: 0, 
      motivo_rechazo: ''
    }
    
    cerrarDrawer() { this.drawerOpen.set(false); }
    tipoArray: { id: number | string; name: string}[] = [];
    deptosArray: { id: number | string; name: string}[] = [];
    tipoMovArray: { id: number | string; name: string}[] = [];
    seriesArray: { id: number | string; name: string}[] = [];
    subseriesArray: { id: number | string; name: string}[] = [];
    seccionesArray: { id: number | string; name: string}[] = [];

    statusArray: { id: number | string; name: string}[] = [];
    constructor(
      private clasificacionserv: ClasificacionService,     
      private router: Router,
    ) {}
    
     ngOnInit() {
      this.getstatus();
      this.getSolicitudes();
    }

    getSolicitudes(){
       this.clasificacionserv.getSolicitudesAdmin().subscribe({
          next: (data) => {
            console.log('data ', data);
            this.solicitudes.set(data);
            this.cargando.set(false);
          },
          error: (err) => {
            this.error.set('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
            this.cargando.set(false);
            console.error(err);
          },
      })
    }

    getstatus(){
      this.clasificacionserv.getstatus().subscribe({
        next: (data) => {
          this.statusArray = [
            { id: '', name: '--Seleccione una opción--' },
            ...data.map((item: { id: number; status: string}) => ({
              id: item.id,
              name: item.status
            }))
          ];
        }
      })
    }

    abrirDetalle(id: number){
      this.solicitudContextId.set(null);
      this.drawerMode.set('solicitud-new');
      this.cargandoSolicitud.set(true);
      this.drawerOpen.set(true);

      this.clasificacionserv.getsolicitud(id).subscribe({
            next: (data: respuetaI) => {
              this.formSolicitudD = {
                id: data.solicitud.id,
                unidad: data.solicitante.departamentoM.nombre_completo, 
                solicitante: data.solicitante.Nombre,
                tipo: data.solicitud.tipoTramite.tipo,
                clasificacion: data.solicitud.movimiento.tipo,
                seccion: data.solicitud.seccion?.codigo + data.solicitud.seccion?.seccion,
                motivo: data.solicitud.motivo, 
                cancelar: data.solicitud.serieM?.codigo + data.solicitud.serieM?.serie ||  data.solicitud.subserieM?.codigo + data.solicitud.subserieM?.subserie,
                codigo: data.solicitud?.codigo,
                adicion: data.solicitud?.adicion, 
                status: data.solicitud.statusSolicitud.id, 
                motivo_rechazo: data.solicitud.motivo_rechazo
              };
              this.cargandoSolicitud.set(false);
      },
        error: (err) => {
          this.error.set('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
          this.cargandoSolicitud.set(false);
          this.drawerOpen.set(false);
          console.error(err);
        },
    })
  }

    guardar(){
      this.guardando.set(true);
        const m = this.drawerMode();
        const onNext = () => { this.guardando.set(false); this.drawerOpen.set(false); this.cargando(); };
        const onError = () => { this.guardando.set(false); alert('Error al guardar. Intenta de nuevo.'); };
        const payload = { ...this.formSolicitudD };
        this.clasificacionserv.editSolicitud(payload).subscribe({
          next: () => {
            this.guardando.set(false);
            this.drawerOpen.set(false);
            this.cargando();
            this.getSolicitudes();
          },
          error: (err) => {
            this.error.set('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
            this.cargando.set(false);
            console.error(err);
          },
      });
    }



}
