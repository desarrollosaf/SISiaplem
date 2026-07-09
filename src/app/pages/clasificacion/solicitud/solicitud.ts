import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ClasificacionService, solicitud, FormSolicitud } from '../../../services/clasificacion.service';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';

type DrawerMode = 'solicitud-new' | 'solicitud-edit';
@Component({
  selector: 'app-solicitud',
  imports: [
    FormsModule,
],
  templateUrl: './solicitud.html',
  styleUrl: './solicitud.css',
})
export class Solicitud {
  cargando = signal(true);
  error = signal('');
  solicitud = signal<solicitud[]>([]);
  drawerOpen = signal(false);
  drawerMode = signal<DrawerMode>('solicitud-new');
  guardando = signal(false);
  cargandoSerie = signal(false);
  serieContextId = signal<number | null>(null);
  formSolicitud: FormSolicitud ={ 
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

  cerrarDrawer() { this.drawerOpen.set(false); }
  tipoArray: { id: number | string; name: string}[] = [];
  deptosArray: { id: number | string; name: string}[] = [];
  tipoMovArray: { id: number | string; name: string}[] = [];
  seriesArray: { id: number | string; name: string}[] = [];
  subseriesArray: { id: number | string; name: string}[] = [];
  seccionesArray: { id: number | string; name: string}[] = [];

  constructor(
    private clasificacionserv: ClasificacionService,     
    private router: Router,
  ) {}

  ngOnInit() {
    this.getsolicitudes();
    this.getTipo()
    this.getDeptos();
    this.gettipotramitemov();
    this.getsecciones();
    this.getseries();
    this.getsubseries();
  }

  getsolicitudes(){
    this.clasificacionserv.getsolicitudes().subscribe({
      next: (data) => {

        console.log('data ', data);
        this.solicitud.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
        this.cargando.set(false);
        console.error(err);
      },
    });
  }

  getTipo(){
    this.clasificacionserv.getTipo().subscribe({
      next: (data) => {
        this.tipoArray = [
          { id: '', name: '--Seleccione una opción--' },
          ...data.map((item: { id: number; tipo: string}) => ({
            id: item.id,
            name: item.tipo
          }))
        ];
      }
    })
  }

  getDeptos(){
    this.clasificacionserv.getDeptos().subscribe({
      next: (data) => {
        this.deptosArray = [
          { id: '', name: '--Seleccione una opción--' },
          ...data.map((item: { id_Departamento: number; nombre_completo: string}) => ({
            id: item.id_Departamento,
            name: item.nombre_completo
          }))
        ];
      }
    })
  }

  gettipotramitemov(){
    this.clasificacionserv.gettipotramitemov().subscribe({
      next: (data) => {
        this.tipoMovArray = [
          { id: '', name: '--Seleccione una opción--' },
          ...data.map((item: { id: number; tipo: string}) => ({
            id: item.id,
            name: item.tipo
          }))
        ];
      }
    })
  }

  getsecciones(){
    this.clasificacionserv.getseccion().subscribe({
      next: (data) => {
        this.seccionesArray = [
          { id: '', name: '--Seleccione una opción--' },
          ...data.map((item: { id: number; codigo: string; seccion: string}) => ({
            id: item.id,
            name: item.codigo + item.seccion
          }))
        ];
      }
    })
  }

  getseries(){
    this.clasificacionserv.getseries().subscribe({
      next: (data) => {
        this.seriesArray = [
          { id: '', name: '--Seleccione una opción--' },
          ...data.map((item: { id: number; codigo: string; serie: string}) => ({
            id: item.id,
            name: item.codigo + item.serie
          }))
        ];
      }
    })
  }

  getsubseries(){
    this.clasificacionserv.getsubseries().subscribe({
      next: (data) => {
        this.subseriesArray = [
          { id: '', name: '--Seleccione una opción--' },
          ...data.map((item: { id: number; codigo: string; subserie: string}) => ({
            id: item.id,
            name: item.codigo + item.subserie
          }))
        ];
      }
    })
  }

  nuevaSolicitud(){
    this.serieContextId.set(null);
    this.drawerMode.set('solicitud-new');
    this.drawerOpen.set(true);

  }

  guardar(){
    this.guardando.set(true);
    const m = this.drawerMode();
    const onNext = () => { this.guardando.set(false); this.drawerOpen.set(false); this.cargando(); };
    const onError = () => { this.guardando.set(false); alert('Error al guardar. Intenta de nuevo.'); };
      this.clasificacionserv.saveSolicitud(this.formSolicitud).subscribe({
        next: () => {
          this.guardando.set(false);
          this.drawerOpen.set(false);
          this.cargando();
          this.getsolicitudes();
        },
          error: (err) => {
            this.error.set('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
            this.cargando.set(false);
            console.error(err);
          },
      });
  }
}
