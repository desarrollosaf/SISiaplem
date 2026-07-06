import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GuiaService, Expediente, TipoTratamiento, ServidorPublico } from '../../services/guia.service';
import { AuthService } from '../../services/auth.service';
import { SearchableSelectComponent, SearchableOption } from '../../components/searchable-select/searchable-select';

type SortKey = 'nombre_ex' | 'anio' | 'serie' | 'estado';

@Component({
  selector: 'app-tramite-expedientes',
  imports: [RouterLink, FormsModule, SearchableSelectComponent],
  templateUrl: './tramite-expedientes.html',
  styleUrl: './tramite-expedientes.css',
})
export class TramiteExpedientesComponent implements OnInit {
  expedientes = signal<Expediente[]>([]);
  cargando = signal(true);
  error = signal('');
  titulo = signal('');
  subtitulo = signal('');

  tipo: 'serie' | 'subserie' | 'activos' | 'cerrados' = 'activos';
  idParam = 0;

  tiposTratamiento = signal<TipoTratamiento[]>([]);
  servidoresPublicos = signal<ServidorPublico[]>([]);
  drawerOpen = signal(false);

  nuevoNombre = '';
  nuevoAnio = String(new Date().getFullYear());
  nuevoTipoExpediente: number | 0 = 0;
  asignacionDirecta = false;
  nuevoResponsable: string | null = null;
  guardando = false;

  confirmCerrarId = signal<number | null>(null);

  busqueda = signal('');
  sortKey = signal<SortKey>('nombre_ex');
  sortDir = signal<1 | -1>(1);
  pagina = signal(1);
  porPagina = 8;

  servidoresOptions = computed<SearchableOption[]>(() =>
    this.servidoresPublicos().map((sp) => ({ value: sp.N_Usuario, label: sp.Nombre, sublabel: sp.N_Usuario })),
  );

  expedientesFiltrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    let lista = this.expedientes();
    if (q) {
      lista = lista.filter((e) =>
        e.nombre_ex.toLowerCase().includes(q) ||
        e.anio.toLowerCase().includes(q) ||
        this.serieLabel(e).toLowerCase().includes(q),
      );
    }
    const key = this.sortKey();
    const dir = this.sortDir();
    lista = [...lista].sort((a, b) => {
      let av: string, bv: string;
      if (key === 'serie') { av = this.serieLabel(a); bv = this.serieLabel(b); }
      else if (key === 'estado') { av = this.estaAbierto(a) ? '0' : '1'; bv = this.estaAbierto(b) ? '0' : '1'; }
      else { av = a[key] ?? ''; bv = b[key] ?? ''; }
      return av.localeCompare(bv) * dir;
    });
    return lista;
  });

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.expedientesFiltrados().length / this.porPagina)));
  paginasArray = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));

  expedientesPagina = computed(() => {
    const inicio = (this.pagina() - 1) * this.porPagina;
    return this.expedientesFiltrados().slice(inicio, inicio + this.porPagina);
  });

  constructor(
    private route: ActivatedRoute,
    private guia: GuiaService,
    private auth: AuthService,
  ) {}

  ngOnInit() {
    const tipo = this.route.snapshot.data['tipo'] as string;
    const id = this.route.snapshot.paramMap.get('id');
    this.idParam = id ? +id : 0;

    if (tipo === 'serie') {
      this.tipo = 'serie';
      this.guia.getSerie(this.idParam).subscribe((s) => {
        if (s) { this.titulo.set(`${s.codigo} – ${s.serie}`); this.subtitulo.set('Expedientes de la serie'); }
      });
      this.cargar(() => this.guia.getExpedientesSerie(this.idParam));
      this.cargarCatalogos();
    } else if (tipo === 'subserie') {
      this.tipo = 'subserie';
      this.guia.getSubserie(this.idParam).subscribe((s) => {
        if (s) { this.titulo.set(`${s.codigo} – ${s.subserie}`); this.subtitulo.set(`${s.serie_codigo} ${s.serie_nombre} › Subserie`); }
      });
      this.cargar(() => this.guia.getExpedientesSubserie(this.idParam));
      this.cargarCatalogos();
    } else if (tipo === 'cerrados') {
      this.tipo = 'cerrados';
      this.titulo.set('Expedientes Cerrados');
      this.subtitulo.set('Todos los expedientes con fecha de cierre registrada');
      this.cargar(() => this.guia.getCerrados(this.auth.userRfc()));
    } else {
      this.tipo = 'activos';
      this.titulo.set('Expedientes Abiertos');
      this.subtitulo.set('Todos los expedientes activos sin fecha de cierre');
      this.cargar(() => this.guia.getActivos(this.auth.userRfc()));
    }
  }

  private cargar(fn: () => any) {
    fn().subscribe({
      next: (data: Expediente[]) => { this.expedientes.set(data); this.cargando.set(false); },
      error: (e: any) => { this.error.set('Error al cargar expedientes. Verifica que el backend esté corriendo.'); this.cargando.set(false); console.error(e); },
    });
  }

  private cargarCatalogos() {
    this.guia.getTiposTratamiento().subscribe({ next: (data) => this.tiposTratamiento.set(data), error: (e) => console.error(e) });
    this.guia.getServidoresPublicos().subscribe({ next: (data) => this.servidoresPublicos.set(data), error: (e) => console.error(e) });
  }

  ordenarPor(key: SortKey) {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === 1 ? -1 : 1));
    } else {
      this.sortKey.set(key);
      this.sortDir.set(1);
    }
  }

  irAPagina(n: number) {
    if (n < 1 || n > this.totalPaginas()) return;
    this.pagina.set(n);
  }

  abrirDrawer() {
    this.nuevoNombre = '';
    this.nuevoAnio = String(new Date().getFullYear());
    this.nuevoTipoExpediente = 0;
    this.asignacionDirecta = false;
    this.nuevoResponsable = null;
    this.drawerOpen.set(true);
  }

  cerrarDrawer() {
    this.drawerOpen.set(false);
  }

  get formularioValido(): boolean {
    if (!this.nuevoNombre.trim() || !this.nuevoAnio || !this.nuevoTipoExpediente) return false;
    if (this.asignacionDirecta && !this.nuevoResponsable) return false;
    return true;
  }

  guardarExpediente() {
    if (!this.formularioValido) return;
    this.guardando = true;
    const dto = {
      ...(this.tipo === 'serie' ? { id_serie: this.idParam } : { id_subserie: this.idParam }),
      nombre_ex: this.nuevoNombre.trim(),
      anio: this.nuevoAnio,
      id_tipo_expediente: this.nuevoTipoExpediente || undefined,
      rfc_usuario_expediente: this.asignacionDirecta ? (this.nuevoResponsable ?? undefined) : undefined,
    };
    this.guia.crearExpediente(dto).subscribe({
      next: (exp) => {
        this.expedientes.update((list) => [exp, ...list]);
        this.guardando = false;
        this.drawerOpen.set(false);
      },
      error: (e) => { this.guardando = false; console.error(e); },
    });
  }

  pedirConfirmarCierre(id: number) {
    this.confirmCerrarId.set(id);
  }

  cancelarCierre() {
    this.confirmCerrarId.set(null);
  }

  confirmarCierre() {
    const id = this.confirmCerrarId();
    if (id == null) return;
    this.guia.cerrarExpediente(id).subscribe({
      next: () => {
        this.expedientes.update((list) =>
          list.map((e) => e.id === id ? { ...e, fecha_cierre_exp: new Date().toISOString().slice(0, 10) } : e),
        );
        this.confirmCerrarId.set(null);
      },
      error: (e) => { console.error(e); this.confirmCerrarId.set(null); },
    });
  }

  estaAbierto(exp: Expediente) { return exp.fecha_cierre_exp == null; }

  serieLabel(exp: Expediente): string {
    if (exp.subserie_codigo) return `${exp.subserie_codigo} ${exp.subserie_nombre}`;
    if (exp.serie_codigo) return `${exp.serie_codigo} ${exp.serie_nombre}`;
    return '—';
  }
}
