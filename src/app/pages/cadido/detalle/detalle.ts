import { Component, OnInit, signal, computed } from '@angular/core';
import { CadidoSevice, detalle, serieI, valoresI, DestinoI, FormSerie, resultado, BitacoraItem } from '../../../services/cadido.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

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

  busqueda = signal('');
  seccionesColapsadas = signal<Set<number>>(new Set());

  cadidoFiltrado = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const data = this.cadido();
    if (!q) return data;

    const coincide = (codigo: string | null | undefined, nombre: string | null | undefined) =>
      (codigo ?? '').toLowerCase().includes(q) || (nombre ?? '').toLowerCase().includes(q);

    return data
      .map((sec) => {
        if (coincide(sec.codigo, sec.seccion)) return sec;
        const series = sec.series
          .map((ser) => {
            if (coincide(ser.codigo, ser.serie)) return ser;
            const subSeries = ser.subSeries.filter((sub) => coincide(sub.codigo, sub.subserie));
            return subSeries.length ? { ...ser, subSeries } : null;
          })
          .filter((s): s is serieI => s !== null);
        return series.length ? { ...sec, series } : null;
      })
      .filter((s): s is detalle => s !== null);
  });

  toggleSeccion(id: number) {
    const set = new Set(this.seccionesColapsadas());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.seccionesColapsadas.set(set);
  }
  estaColapsada(id: number) { return this.seccionesColapsadas().has(id); }
  expandirTodo() { this.seccionesColapsadas.set(new Set()); }
  colapsarTodo() { this.seccionesColapsadas.set(new Set(this.cadido().map((s) => s.id))); }

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
    id_tecnica: null,
  };

  cerrarDrawer() { this.drawerOpen.set(false); }
  valoresArray: { id: number | string; name: string}[] = [];
  destinosArray: { id: number | string; name: string}[] = [];
  tecnicasArray: { id: number | string; name: string}[] = [];

  historialOpen = signal(false);
  historialCargando = signal(false);
  historialItems = signal<BitacoraItem[]>([]);

  private get rfc() { return this.auth.userRfc(); }

  constructor(
    private cadidoserv: CadidoSevice,
    private router: Router,
    private  aRouter: ActivatedRoute,
    private fb: FormBuilder,
    private auth: AuthService,
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
          id_tecnica: data.series.id_tecnica,
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
          this.tecnicasArray = [
          { id: '', name: '--Seleccione una opción--' },
          ...data.tecnicasS.map((item: { id: number; valor: string}) => ({
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

  actualizarTotal() {
    const at = Number(this.formSerie.anio_tramite) || 0;
    const ac = Number(this.formSerie.anios_consentracion) || 0;
    this.formSerie.total_anios = at + ac;
  }

  guardar(){
    this.guardando.set(true);
    const payload = { ...this.formSerie, tipo: this.tipo, rfc: this.rfc };
    this.cadidoserv.update(this.idSerie, payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.drawerOpen.set(false);
        this.getcadido();
      },
        error: (err) => {
          this.guardando.set(false);
          alert('Error al guardar. Intenta de nuevo.');
          console.error(err);
        },
      });
    }

    get mostrarSubserie(): boolean {
      return !!this.formSerie.subserie;
    }

    verHistorial(id: number, tipo: number) {
      this.historialOpen.set(true);
      this.historialCargando.set(true);
      this.historialItems.set([]);
      this.cadidoserv.getBitacora(tipo, id).subscribe({
        next: (data) => {
          this.historialItems.set(data);
          this.historialCargando.set(false);
        },
        error: (err) => {
          this.historialCargando.set(false);
          console.error(err);
        },
      });
    }

    cerrarHistorial() { this.historialOpen.set(false); }

}
