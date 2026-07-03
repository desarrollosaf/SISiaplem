import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ResponsablesService,
  ResponsableItem,
  TipoUsuario,
  Dependencia,
  Departamento,
  Usuario,
  Edificio,
  ResponsableDto,
} from '../../services/responsables.service';

type SortCol = 'tipo_nombre' | 'nombre_responsable' | 'nombre_departamento' | 'nombre_dependencia' | 'email' | 'status';

@Component({
  selector: 'app-responsables',
  imports: [FormsModule],
  templateUrl: './responsables.html',
  styleUrl: './responsables.css',
})
export class ResponsablesComponent implements OnInit {
  // ── datos ──────────────────────────────────────────────────────────────
  responsables  = signal<ResponsableItem[]>([]);
  cargando      = signal(true);
  error         = signal('');

  // ── catálogos ───────────────────────────────────────────────────────────
  tipos         = signal<TipoUsuario[]>([]);
  dependencias  = signal<Dependencia[]>([]);
  departamentos = signal<Departamento[]>([]);
  usuarios      = signal<Usuario[]>([]);
  edificios     = signal<Edificio[]>([]);
  cargandoDep   = signal(false);
  cargandoUsu   = signal(false);

  // ── tabla ───────────────────────────────────────────────────────────────
  filtro     = signal('');
  sortCol    = signal<SortCol>('tipo_nombre');
  sortDir    = signal<'asc' | 'desc'>('asc');
  pagina     = signal(1);
  readonly porPagina = 10;

  // ── drawer ─────────────────────────────────────────────────────────────
  drawerOpen      = signal(false);
  modoEdicion     = signal(false);
  idEditando      = signal<number | null>(null);
  guardando       = signal(false);
  confirmDeleteId = signal<number | null>(null);

  // ── formulario ─────────────────────────────────────────────────────────
  idDependenciaSeleccionada = 0;
  form: ResponsableDto = this.formVacio();

  // ── paleta de colores por perfil ────────────────────────────────────────
  private readonly PALETA = [
    'tipo-pill-0', 'tipo-pill-1', 'tipo-pill-2',
    'tipo-pill-3', 'tipo-pill-4', 'tipo-pill-5',
  ];

  // ── computed ────────────────────────────────────────────────────────────
  private filtrados = computed(() => {
    const q = this.filtro().toLowerCase();
    return q
      ? this.responsables().filter(r =>
          r.nombre_responsable.toLowerCase().includes(q) ||
          r.tipo_nombre.toLowerCase().includes(q) ||
          r.nombre_departamento.toLowerCase().includes(q) ||
          r.nombre_dependencia.toLowerCase().includes(q) ||
          (r.email ?? '').toLowerCase().includes(q),
        )
      : this.responsables();
  });

  private sortedFiltrados = computed(() => {
    const col = this.sortCol();
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...this.filtrados()].sort((a, b) => {
      const va = String(a[col] ?? '').toLowerCase();
      const vb = String(b[col] ?? '').toLowerCase();
      if (va !== vb) return va < vb ? -dir : dir;
      // secundario: nombre dentro del mismo valor de la columna principal
      const na = a.nombre_responsable.toLowerCase();
      const nb = b.nombre_responsable.toLowerCase();
      return na < nb ? -1 : na > nb ? 1 : 0;
    });
  });

  paginados = computed(() => {
    const start = (this.pagina() - 1) * this.porPagina;
    return this.sortedFiltrados().slice(start, start + this.porPagina);
  });

  totalFiltrados  = computed(() => this.filtrados().length);
  totalPaginas    = computed(() => Math.max(1, Math.ceil(this.filtrados().length / this.porPagina)));

  paginasVisibles = computed<(number | null)[]>(() => {
    const total  = this.totalPaginas();
    const actual = this.pagina();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const set = new Set<number>([1, total]);
    for (let i = actual - 1; i <= actual + 1; i++) {
      if (i >= 1 && i <= total) set.add(i);
    }

    const sorted = [...set].sort((a, b) => a - b);
    const result: (number | null)[] = [];
    let prev = 0;
    for (const p of sorted) {
      if (prev && p - prev > 1) result.push(null);
      result.push(p);
      prev = p;
    }
    return result;
  });

  tipoColorMap = computed<Map<string, number>>(() => {
    const map = new Map<string, number>();
    let idx = 0;
    for (const r of this.responsables()) {
      if (!map.has(r.tipo_nombre)) {
        map.set(r.tipo_nombre, idx % this.PALETA.length);
        idx++;
      }
    }
    return map;
  });

  get formularioValido(): boolean {
    return this.form.tipo_id > 0 && !!this.form.rfc_responsable && this.form.id_Departamento > 0;
  }

  tipoPillClass(tipoNombre: string): string {
    return this.PALETA[this.tipoColorMap().get(tipoNombre) ?? 0];
  }

  constructor(private svc: ResponsablesService) {}

  ngOnInit() {
    this.cargar();
    this.svc.getTiposUsuario().subscribe({ next: d => this.tipos.set(d), error: () => {} });
    this.svc.getDependencias().subscribe({ next: d => this.dependencias.set(d), error: () => {} });
    this.svc.getEdificios().subscribe({ next: d => this.edificios.set(d), error: () => {} });
  }

  cargar() {
    this.cargando.set(true);
    this.error.set('');
    this.svc.getAll().subscribe({
      next:  d => { this.responsables.set(d); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo conectar con el servidor.'); this.cargando.set(false); },
    });
  }

  // ── cascade ─────────────────────────────────────────────────────────────
  onDependenciaChange() {
    this.departamentos.set([]);
    this.usuarios.set([]);
    this.form.rfc_responsable = '';
    this.form.id_Departamento = 0;
    if (!this.idDependenciaSeleccionada) return;
    this.cargandoDep.set(true);
    this.svc.getDepartamentos(this.idDependenciaSeleccionada).subscribe({
      next:  d => { this.departamentos.set(d); this.cargandoDep.set(false); },
      error: () => this.cargandoDep.set(false),
    });
  }

  onDepartamentoChange() {
    this.usuarios.set([]);
    this.form.rfc_responsable = '';
    if (!this.form.id_Departamento) return;
    this.cargandoUsu.set(true);
    this.svc.getUsuarios(this.form.id_Departamento).subscribe({
      next:  u => { this.usuarios.set(u); this.cargandoUsu.set(false); },
      error: () => this.cargandoUsu.set(false),
    });
  }

  // ── tabla ───────────────────────────────────────────────────────────────
  ordenar(col: SortCol) {
    if (this.sortCol() === col) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortCol.set(col);
      this.sortDir.set('asc');
    }
  }

  onFiltroChange(v: string) {
    this.filtro.set(v);
    this.pagina.set(1);
  }

  sortIcon(col: SortCol): string {
    if (this.sortCol() !== col) return 'bi-arrow-down-up text-muted';
    return this.sortDir() === 'asc' ? 'bi-sort-up' : 'bi-sort-down';
  }

  // ── paginación ──────────────────────────────────────────────────────────
  irA(p: number)  { this.pagina.set(p); }
  anterior()      { if (this.pagina() > 1) this.pagina.update(p => p - 1); }
  siguiente()     { if (this.pagina() < this.totalPaginas()) this.pagina.update(p => p + 1); }

  get paginaDesde() { return (this.pagina() - 1) * this.porPagina + 1; }
  get paginaHasta() { return Math.min(this.pagina() * this.porPagina, this.totalFiltrados()); }

  // ── drawer ──────────────────────────────────────────────────────────────
  abrirNuevo() {
    this.form = this.formVacio();
    this.idDependenciaSeleccionada = 0;
    this.departamentos.set([]);
    this.usuarios.set([]);
    this.modoEdicion.set(false);
    this.idEditando.set(null);
    this.drawerOpen.set(true);
  }

  abrirEditar(item: ResponsableItem) {
    // Pre-poblar con el responsable actual para que la opción ya exista al abrir el drawer
    this.usuarios.set([{ rfc: item.rfc_responsable, nombre: item.nombre_responsable }]);

    this.form = {
      tipo_id:         item.tipo_id,
      rfc_responsable: item.rfc_responsable,
      id_Departamento: item.id_Departamento,
      email:           item.email ?? '',
      tel:             item.tel ?? '',
      ext:             item.ext ?? '',
      id_edificio:     item.id_edificio ?? 0,
    };
    this.idDependenciaSeleccionada = item.id_Dependencia;
    this.modoEdicion.set(true);
    this.idEditando.set(item.id);
    this.drawerOpen.set(true);

    this.cargandoDep.set(true);
    this.svc.getDepartamentos(item.id_Dependencia).subscribe({
      next: d => {
        this.departamentos.set(d);
        this.cargandoDep.set(false);
        this.cargandoUsu.set(true);
        this.svc.getUsuarios(item.id_Departamento).subscribe({
          next: u => {
            // Garantizar que el responsable actual siempre esté en la lista
            const lista = u.some(x => x.rfc === item.rfc_responsable)
              ? u
              : [{ rfc: item.rfc_responsable, nombre: item.nombre_responsable }, ...u];
            this.usuarios.set(lista);
            this.cargandoUsu.set(false);
          },
          error: () => this.cargandoUsu.set(false),
        });
      },
      error: () => this.cargandoDep.set(false),
    });
  }

  cerrarDrawer() { this.drawerOpen.set(false); }

  guardar() {
    if (!this.formularioValido) return;
    this.guardando.set(true);
    const op = this.modoEdicion()
      ? this.svc.update(this.idEditando()!, this.form)
      : this.svc.create(this.form);
    op.subscribe({
      next:  () => { this.guardando.set(false); this.drawerOpen.set(false); this.cargar(); },
      error: () => { this.guardando.set(false); alert('Error al guardar. Intenta de nuevo.'); },
    });
  }

  pedirConfirmarEliminar(id: number) { this.confirmDeleteId.set(id); }
  cancelarEliminar()                 { this.confirmDeleteId.set(null); }

  confirmarEliminar() {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.svc.remove(id).subscribe({
      next:  () => { this.confirmDeleteId.set(null); this.cargar(); },
      error: () => alert('No se pudo eliminar el responsable.'),
    });
  }

  toggleStatus(item: ResponsableItem) {
    this.svc.toggleStatus(item.id).subscribe({
      next:  () => this.cargar(),
      error: () => alert('No se pudo actualizar el estatus.'),
    });
  }

  private formVacio(): ResponsableDto {
    return { tipo_id: 0, rfc_responsable: '', id_Departamento: 0, email: '', tel: '', ext: '', id_edificio: 0 };
  }
}
