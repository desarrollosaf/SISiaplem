import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  SubfondoService,
  SubfondoItem,
  SubfondoDetalle,
  SeccionDetalle,
  Dependencia,
  SubfondoDto,
} from '../../services/subfondo.service';
import { FichaValoracionService, TipoDoc } from '../../services/ficha-valoracion.service';

type TabId = 'subfondos' | 'disposicion' | 'fichas';
type FichaSortCol = 'tipo_doc' | 'status';

@Component({
  selector: 'app-cgca-subfondo',
  imports: [FormsModule],
  templateUrl: './cgca-subfondo.html',
  styleUrl: './cgca-subfondo.css',
})
export class CgcaSubfondoComponent implements OnInit {
  tab = signal<TabId>('subfondos');

  // ===== Subfondos =====
  subfondos = signal<SubfondoItem[]>([]);
  dependencias = signal<Dependencia[]>([]);
  cargando = signal(true);
  error = signal('');
  guardando = signal(false);
  drawerOpen = signal(false);
  modoEdicion = signal(false);
  idEditando = signal<number | null>(null);
  filtro = signal('');
  confirmDeleteId = signal<number | null>(null);

  detalleOpen = signal(false);
  subfondoDetalle = signal<SubfondoDetalle | null>(null);
  cargandoDetalle = signal(false);
  jerarquia = signal<SeccionDetalle[]>([]);

  form: SubfondoDto = { codigo: '', subfondo: '', id_Dependencia: 0 };

  subfondosFiltrados = computed(() => {
    const q = this.filtro().toLowerCase();
    if (!q) return this.subfondos();
    return this.subfondos().filter(
      s =>
        s.codigo.toLowerCase().includes(q) ||
        s.subfondo.toLowerCase().includes(q) ||
        s.nombre_dependencia.toLowerCase().includes(q),
    );
  });

  // ===== Fichas de Valoración (Tipo de Documento) =====
  fichas = signal<TipoDoc[]>([]);
  fichaCargando = signal(true);
  fichaError = signal('');
  fichaFiltro = signal('');
  fichaDrawerOpen = signal(false);
  fichaModoEdicion = signal(false);
  fichaIdEditando = signal<number | null>(null);
  fichaGuardando = signal(false);
  fichaForm = { tipo_doc: '' };
  fichaCargada = false;

  fichaSortCol = signal<FichaSortCol>('tipo_doc');
  fichaSortDir = signal<'asc' | 'desc'>('asc');
  fichaPagina = signal(1);
  readonly fichaPorPagina = 10;

  fichasFiltradas = computed(() => {
    const q = this.fichaFiltro().toLowerCase();
    if (!q) return this.fichas();
    return this.fichas().filter(f => f.tipo_doc.toLowerCase().includes(q));
  });

  private fichasSortedFiltradas = computed(() => {
    const col = this.fichaSortCol();
    const dir = this.fichaSortDir() === 'asc' ? 1 : -1;
    return [...this.fichasFiltradas()].sort((a, b) => {
      const va = col === 'status' ? a.status : a.tipo_doc.toLowerCase();
      const vb = col === 'status' ? b.status : b.tipo_doc.toLowerCase();
      if (va === vb) return 0;
      return va < vb ? -dir : dir;
    });
  });

  fichasPaginadas = computed(() => {
    const start = (this.fichaPagina() - 1) * this.fichaPorPagina;
    return this.fichasSortedFiltradas().slice(start, start + this.fichaPorPagina);
  });

  fichaTotalFiltrados = computed(() => this.fichasFiltradas().length);
  fichaTotalPaginas = computed(() => Math.max(1, Math.ceil(this.fichaTotalFiltrados() / this.fichaPorPagina)));

  fichaPaginasVisibles = computed<(number | null)[]>(() => {
    const total = this.fichaTotalPaginas();
    const actual = this.fichaPagina();
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

  constructor(
    private svc: SubfondoService,
    private fichaSvc: FichaValoracionService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.cargar();
    this.svc.getDependencias().subscribe({
      next: d => this.dependencias.set(d),
      error: () => {},
    });
  }

  cambiarTab(tab: TabId) {
    this.tab.set(tab);
    if (tab === 'fichas' && !this.fichaCargada) {
      this.cargarFichas();
    }
  }

  // ───────── Subfondos ─────────

  cargar() {
    this.cargando.set(true);
    this.error.set('');
    this.svc.getAll().subscribe({
      next: data => {
        this.subfondos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo conectar con el servidor.');
        this.cargando.set(false);
      },
    });
  }

  abrirNuevo() {
    this.form = { codigo: '', subfondo: '', id_Dependencia: 0 };
    this.modoEdicion.set(false);
    this.idEditando.set(null);
    this.detalleOpen.set(false);
    this.drawerOpen.set(true);
  }

  abrirEditar(item: SubfondoItem) {
    this.form = {
      codigo: item.codigo,
      subfondo: item.subfondo,
      id_Dependencia: item.id_Dependencia,
    };
    this.modoEdicion.set(true);
    this.idEditando.set(item.id);
    this.detalleOpen.set(false);
    this.drawerOpen.set(true);
  }

  cerrarDrawer() {
    this.drawerOpen.set(false);
  }

  abrirDetalle(item: SubfondoItem) {
    this.router.navigate(['/admin/instrumentos/cgca/subfondo', item.id]);
  }

  cerrarDetalle() {
    this.detalleOpen.set(false);
    this.subfondoDetalle.set(null);
    this.jerarquia.set([]);
  }

  cerrarTodo() {
    this.drawerOpen.set(false);
    this.detalleOpen.set(false);
    this.subfondoDetalle.set(null);
    this.jerarquia.set([]);
    this.fichaDrawerOpen.set(false);
  }

  guardar() {
    if (!this.form.codigo.trim() || !this.form.subfondo.trim() || !this.form.id_Dependencia) return;
    this.guardando.set(true);

    const op = this.modoEdicion()
      ? this.svc.update(this.idEditando()!, this.form)
      : this.svc.create(this.form);

    op.subscribe({
      next: () => {
        this.guardando.set(false);
        this.drawerOpen.set(false);
        this.cargar();
      },
      error: () => {
        this.guardando.set(false);
        alert('Ocurrió un error al guardar. Intenta de nuevo.');
      },
    });
  }

  pedirConfirmarEliminar(id: number) {
    this.confirmDeleteId.set(id);
  }

  cancelarEliminar() {
    this.confirmDeleteId.set(null);
  }

  confirmarEliminar() {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.svc.remove(id).subscribe({
      next: () => {
        this.confirmDeleteId.set(null);
        this.detalleOpen.set(false);
        this.subfondoDetalle.set(null);
        this.cargar();
      },
      error: () => alert('No se pudo eliminar el subfondo.'),
    });
  }

  verCgcaPdf() {
    this.svc.getCuadroUrl().subscribe({
      next: (res: { url: string }) => window.open(res.url, '_blank'),
      error: () => alert('No se pudo obtener la ruta del CGCA.'),
    });
  }

  get formularioValido(): boolean {
    return (
      this.form.codigo.trim().length > 0 &&
      this.form.subfondo.trim().length > 0 &&
      Number(this.form.id_Dependencia) > 0
    );
  }

  // ───────── Fichas de Valoración ─────────

  cargarFichas() {
    this.fichaCargando.set(true);
    this.fichaError.set('');
    this.fichaSvc.getAll().subscribe({
      next: data => {
        this.fichas.set(data);
        this.fichaCargando.set(false);
        this.fichaCargada = true;
      },
      error: () => {
        this.fichaError.set('No se pudo conectar con el servidor.');
        this.fichaCargando.set(false);
      },
    });
  }

  abrirNuevaFicha() {
    this.fichaForm = { tipo_doc: '' };
    this.fichaModoEdicion.set(false);
    this.fichaIdEditando.set(null);
    this.fichaDrawerOpen.set(true);
  }

  abrirEditarFicha(item: TipoDoc) {
    this.fichaForm = { tipo_doc: item.tipo_doc };
    this.fichaModoEdicion.set(true);
    this.fichaIdEditando.set(item.id);
    this.fichaDrawerOpen.set(true);
  }

  cerrarFichaDrawer() {
    this.fichaDrawerOpen.set(false);
  }

  get fichaFormularioValido(): boolean {
    return this.fichaForm.tipo_doc.trim().length > 0;
  }

  guardarFicha() {
    if (!this.fichaFormularioValido) return;
    this.fichaGuardando.set(true);

    const op = this.fichaModoEdicion()
      ? this.fichaSvc.update(this.fichaIdEditando()!, this.fichaForm)
      : this.fichaSvc.create(this.fichaForm);

    op.subscribe({
      next: () => {
        this.fichaGuardando.set(false);
        this.fichaDrawerOpen.set(false);
        this.cargarFichas();
      },
      error: () => {
        this.fichaGuardando.set(false);
        alert('Ocurrió un error al guardar. Intenta de nuevo.');
      },
    });
  }

  toggleFichaStatus(item: TipoDoc) {
    this.fichaSvc.toggleStatus(item.id).subscribe({
      next: () => this.cargarFichas(),
      error: () => alert('No se pudo actualizar el estatus.'),
    });
  }

  ordenarFicha(col: FichaSortCol) {
    if (this.fichaSortCol() === col) {
      this.fichaSortDir.set(this.fichaSortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.fichaSortCol.set(col);
      this.fichaSortDir.set('asc');
    }
  }

  onFichaFiltroChange(v: string) {
    this.fichaFiltro.set(v);
    this.fichaPagina.set(1);
  }

  fichaSortIcon(col: FichaSortCol): string {
    if (this.fichaSortCol() !== col) return 'bi-arrow-down-up text-muted';
    return this.fichaSortDir() === 'asc' ? 'bi-sort-up' : 'bi-sort-down';
  }

  fichaIrA(p: number) { this.fichaPagina.set(p); }
  fichaAnterior() { if (this.fichaPagina() > 1) this.fichaPagina.update(p => p - 1); }
  fichaSiguiente() { if (this.fichaPagina() < this.fichaTotalPaginas()) this.fichaPagina.update(p => p + 1); }

  get fichaPaginaDesde() { return (this.fichaPagina() - 1) * this.fichaPorPagina + 1; }
  get fichaPaginaHasta() { return Math.min(this.fichaPagina() * this.fichaPorPagina, this.fichaTotalFiltrados()); }
}
