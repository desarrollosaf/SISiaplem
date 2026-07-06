import { Component, OnInit, signal } from '@angular/core';
import { CadidoSevice, detalle, serieI, valoresI, DestinoI, FormSerie, resultado } from '../../../services/cadido.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';

type DrawerMode = 'serie-new' | 'serie-edit' | 'subserie-new' | 'subserie-edit' | 'seccion-edit';

@Component({
  selector: 'app-detalle',
  imports: [
    FormsModule
],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css',
})
export class Detalle implements OnInit{
  cargando = signal(true);
  error = signal('');
  cadido = signal<detalle[]>([]);
  id:any;
  idSerie: any;
  idSubserie: any;
  tipo: any;

  drawerOpen = signal(false);
  drawerMode = signal<DrawerMode>('serie-new');
  guardando = signal(false);
  cargandoSerie = signal(false);
  serieContextId = signal<number | null>(null);
  formSerie: FormSerie = { 
    codigo: '', 
    serie: '', 
    subserie: null,
    anio_tramite: 0, 
    anios_consentracion: 0, 
    total_anios: 0, 
    valoresSeleccionados: [] as number[],
    destino: null,
    id_destino: 0,
  };

  cerrarDrawer() { this.drawerOpen.set(false); }
  valoresArray: { id: number | string; name: string}[] = [];
  destinosArray: { id: number | string; name: string}[] = [];


  constructor(
    private cadidoserv: CadidoSevice,     
    private router: Router,
    private  aRouter: ActivatedRoute,
    private fb: FormBuilder,
  ) {
    this.id = aRouter.snapshot.paramMap.get('id');
  }

   ngOnInit(){
      if(this.id != null){
        this.getcadido();
      }
  }

  getcadido(){
    this.cadidoserv.getcadido(this.id).subscribe({
      next: (data) => {
        this.cadido.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
        this.cargando.set(false);
        console.error(err);
      },
    });
  }

  editSerie(id: number, tipo: number) {
    this.tipo = tipo;
    this.idSerie = id;

    this.serieContextId.set(null);
    this.drawerMode.set('serie-new');
    this.cargandoSerie.set(true);
    this.drawerOpen.set(true);

    this.cadidoserv.getserie(id, tipo).subscribe({
      next: (data: resultado) => {
        this.formSerie = {
          codigo: data.series.codigo,
          serie: data.series.serie,
          subserie: data.series.subserie,
          anio_tramite: data.series.anio_tramite,
          anios_consentracion: data.series.anios_consentracion,
          total_anios: data.series.total_anios,
          valoresSeleccionados : data.series.valores.map(v => v.id_valor),
          destino: data.series.destino,
          id_destino: data.series.id_destino,
        };
        this.valoresArray = [
          { id: '', name: '--Seleccione una opción--' },
          ...data.valoresS.map((item: { id: number; valor: string}) => ({
            id: item.id,
            name: item.valor
          }))
        ];
          this.destinosArray = [
          { id: '', name: '--Seleccione una opción--' },
          ...data.destinosS.map((item: { id: number; valor: string}) => ({
            id: item.id,
            name: item.valor
          }))
        ];
        this.cargandoSerie.set(false);
      },
        error: (err) => {
          this.error.set('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
          this.cargandoSerie.set(false);
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
    const payload = { ...this.formSerie, tipo: this.tipo };
    this.cadidoserv.update(this.idSerie, payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.drawerOpen.set(false);
        this.cargando();
        this.getcadido();
      },
        error: (err) => {
          this.error.set('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
          this.cargando.set(false);
          console.error(err);
        },
      });
    }

    get mostrarSubserie(): boolean {
      return !!this.formSerie.subserie;
    }

}
