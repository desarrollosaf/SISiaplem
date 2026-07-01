import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  SeccionService,
  SeccionItem,
  SerieItem,
  SubserieItem,
  SubsubserieItem,
  TipoSeccion,
  DireccionItem,
  AreaAdministrativaItem,
  TipoDocumentalItem,
} from '../../services/seccion.service';
import { SubfondoService, SubfondoItem } from '../../services/subfondo.service';

type DrawerMode =
  | 'seccion-edit'
  | 'serie-new'
  | 'serie-edit'
  | 'subserie-new'
  | 'subserie-edit'
  | 'subsubserie-new'
  | 'subsubserie-edit';

interface ConfirmAction {
  id: number;
  nombre: string;
  tipo: 'serie' | 'subserie' | 'subsubserie';
}

@Component({
  selector: 'app-seccion-detalle',
  imports: [FormsModule],
  templateUrl: './seccion-detalle.html',
  styleUrl: './seccion-detalle.css',
})
export class SeccionDetalleComponent implements OnInit {
  subfondoId = 0;
  seccionId = 0;

  seccion = signal<SeccionItem | null>(null);
  subfondo = signal<SubfondoItem | null>(null);
  cargando = signal(true);
  error = signal('');

  tiposSecciones = signal<TipoSeccion[]>([]);
  direccionesOpciones = signal<DireccionItem[]>([]);
  cargandoDirecciones = signal(false);
  tipoDocumentales = signal<TipoDocumentalItem[]>([]);

  // Cascade serie: dirección → área administrativa
  areasAdministrativas = signal<AreaAdministrativaItem[]>([]);
  cargandoAreas = signal(false);
  idDireccionSerie = signal<number | null>(null);

  // Cascade subserie
  areasAdministrativasSub = signal<AreaAdministrativaItem[]>([]);
  cargandoAreasSub = signal(false);
  idDireccionSubserie = signal<number | null>(null);

  series = computed(() => this.seccion()?.series ?? []);
  expandedSerieId = signal<number | null>(null);

  drawerOpen = signal(false);
  drawerMode = signal<DrawerMode>('serie-new');
  guardando = signal(false);

  serieContextId = signal<number | null>(null);

  isOsfem = computed(() => this.subfondo()?.id_Dependencia === 3);

  formSerie = { codigo: '', serie: '', departamento_id: null as number | null };
  formSubserie = { codigo: '', subserie: '', id_Departamento: null as number | null };
  formSubsubserie = { codigo: '', subsubserie: '', id_departamento: null as number | null };
  formSeccion = { codigo: '', seccion: '', id_tipo_seccion: 0 };

  // Cascade subsubserie
  areasAdministrativasSubsub = signal<AreaAdministrativaItem[]>([]);
  cargandoAreasSubsub = signal(false);
  idDireccionSubsubserie = signal<number | null>(null);

  // serieContextId is reused; subserieContextId tracks parent subserie for subsubserie-new
  subserieContextId = signal<number | null>(null);

  selectedDirIds = signal<number[]>([]);
  selectedTipoDocSerieIds = signal<number[]>([]);
  selectedTipoDocSubserieIds = signal<number[]>([]);
  selectedTipoDocSubsubserieIds = signal<number[]>([]);

  confirmAction = signal<ConfirmAction | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: SeccionService,
    private subfondoSvc: SubfondoService,
  ) {}

  ngOnInit() {
    this.subfondoId = Number(this.route.snapshot.paramMap.get('subfondoId'));
    this.seccionId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar();
    this.svc.getTipoSecciones().subscribe({ next: t => this.tiposSecciones.set(t) });
    this.svc.getTipoDocumentales().subscribe({ next: t => this.tipoDocumentales.set(t) });
    this.cargandoDirecciones.set(true);
    this.svc.getDirecciones(this.subfondoId).subscribe({
      next: dirs => { this.direccionesOpciones.set(dirs); this.cargandoDirecciones.set(false); },
      error: () => this.cargandoDirecciones.set(false),
    });
    this.subfondoSvc.getAll().subscribe({
      next: sfs => {
        const sf = sfs.find(s => s.id === this.subfondoId);
        if (sf) this.subfondo.set(sf);
      },
    });
  }

  areaLabels = signal<Record<number, string>>({});

  cargar() {
    this.cargando.set(true);
    this.error.set('');
    this.svc.getById(this.seccionId).subscribe({
      next: sec => {
        this.seccion.set(sec);
        this.cargando.set(false);
        this.cargarAreaLabels(sec);
      },
      error: () => { this.error.set('No se pudo cargar la sección.'); this.cargando.set(false); },
    });
  }

  private cargarAreaLabels(sec: SeccionItem | null) {
    if (!sec) return;
    const ids = new Set<number>();
    for (const ser of sec.series ?? []) {
      if (ser.departamento_id) ids.add(ser.departamento_id);
      for (const sub of ser.subSeries ?? []) {
        if (sub.id_Departamento) ids.add(sub.id_Departamento);
        for (const sss of sub.subsubSeries ?? []) {
          if (sss.id_departamento) ids.add(sss.id_departamento);
        }
      }
    }
    if (ids.size === 0) return;
    this.svc.getAreaNames([...ids]).subscribe({
      next: items => {
        const map: Record<number, string> = {};
        for (const item of items) map[item.id] = item.label;
        this.areaLabels.set(map);
      },
    });
  }

  volver() {
    this.router.navigate(['/dashboard/admin/instrumentos/cgca/subfondo', this.subfondoId]);
  }

  nombreTipo(id: number): string {
    return this.tiposSecciones().find(t => t.id === id)?.valor ?? `Tipo ${id}`;
  }

  nombreDir(id: number | null | undefined): string {
    if (!id) return '—';
    return (
      this.areaLabels()[id] ??
      this.direccionesOpciones().find(d => d.id === id)?.label ??
      this.areasAdministrativas().find(a => a.id === id)?.label ??
      this.areasAdministrativasSub().find(a => a.id === id)?.label ??
      this.areasAdministrativasSubsub().find(a => a.id === id)?.label ??
      '—'
    );
  }

  nombreTipoDoc(id: number | null): string {
    if (!id) return '—';
    return this.tipoDocumentales().find(t => t.id === id)?.tipo_doc ?? `Tipo ${id}`;
  }

  // ── Accordion ─────────────────────────────────────────────────────────────

  toggleAccordion(serieId: number) {
    this.expandedSerieId.set(this.expandedSerieId() === serieId ? null : serieId);
  }

  isExpanded(serieId: number): boolean {
    return this.expandedSerieId() === serieId;
  }

  // ── Direcciones multi-select (para sección) ───────────────────────────────

  isDirSelected(id: number): boolean { return this.selectedDirIds().includes(id); }
  toggleDir(id: number) {
    const ids = this.selectedDirIds();
    this.selectedDirIds.set(ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  }

  // ── Tipo Documental (serie) ───────────────────────────────────────────────

  isTipoDocSerieSelected(id: number): boolean { return this.selectedTipoDocSerieIds().includes(id); }
  toggleTipoDocSerie(id: number) {
    const ids = this.selectedTipoDocSerieIds();
    this.selectedTipoDocSerieIds.set(ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  }

  // ── Tipo Documental (subserie) ────────────────────────────────────────────

  isTipoDocSubserieSelected(id: number): boolean { return this.selectedTipoDocSubserieIds().includes(id); }
  toggleTipoDocSubserie(id: number) {
    const ids = this.selectedTipoDocSubserieIds();
    this.selectedTipoDocSubserieIds.set(ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  }

  // ── Tipo Documental (subsubserie) ─────────────────────────────────────────

  isTipoDocSubsubserieSelected(id: number): boolean { return this.selectedTipoDocSubsubserieIds().includes(id); }
  toggleTipoDocSubsubserie(id: number) {
    const ids = this.selectedTipoDocSubsubserieIds();
    this.selectedTipoDocSubsubserieIds.set(ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  }

  // ── Cascading: Dirección → Área Administrativa ───────────────────────────

  onDireccionSerieChange(id: number | null) {
    this.idDireccionSerie.set(id);
    this.formSerie.departamento_id = null;
    this.areasAdministrativas.set([]);
    if (!id) return;
    this.cargandoAreas.set(true);
    this.svc.getAreaAdministrativa(id).subscribe({
      next: areas => { this.areasAdministrativas.set(areas); this.cargandoAreas.set(false); },
      error: () => this.cargandoAreas.set(false),
    });
  }

  onDireccionSubserieChange(id: number | null) {
    this.idDireccionSubserie.set(id);
    this.formSubserie.id_Departamento = null;
    this.areasAdministrativasSub.set([]);
    if (!id) return;
    this.cargandoAreasSub.set(true);
    this.svc.getAreaAdministrativa(id).subscribe({
      next: areas => { this.areasAdministrativasSub.set(areas); this.cargandoAreasSub.set(false); },
      error: () => this.cargandoAreasSub.set(false),
    });
  }

  onDireccionSubsubserieChange(id: number | null) {
    this.idDireccionSubsubserie.set(id);
    this.formSubsubserie.id_departamento = null;
    this.areasAdministrativasSubsub.set([]);
    if (!id) return;
    this.cargandoAreasSubsub.set(true);
    this.svc.getAreaAdministrativa(id).subscribe({
      next: areas => { this.areasAdministrativasSubsub.set(areas); this.cargandoAreasSubsub.set(false); },
      error: () => this.cargandoAreasSubsub.set(false),
    });
  }

  // Carga la dirección padre de un departamento y las áreas de esa dirección (para pre-selección en edit)
  private precargarCascada(
    departamentoId: number | null | undefined,
    setDir: (id: number | null) => void,
    setCargando: (v: boolean) => void,
    setAreas: (a: AreaAdministrativaItem[]) => void,
  ) {
    if (!departamentoId) { setDir(null); setAreas([]); return; }
    this.svc.getDepartamentoInfo(departamentoId).subscribe({
      next: info => {
        if (!info) { setDir(null); setAreas([]); return; }
        setDir(info.id_Direccion);
        setCargando(true);
        this.svc.getAreaAdministrativa(info.id_Direccion).subscribe({
          next: areas => { setAreas(areas); setCargando(false); },
          error: () => setCargando(false),
        });
      },
      error: () => { setDir(null); setAreas([]); },
    });
  }

  // ── Editar sección ────────────────────────────────────────────────────────

  abrirEditarSeccion() {
    const s = this.seccion();
    if (!s) return;
    this.formSeccion = { codigo: s.codigo, seccion: s.seccion, id_tipo_seccion: s.id_tipo_seccion };
    this.selectedDirIds.set(s.direccion_ids ?? []);
    this.drawerMode.set('seccion-edit');
    this.drawerOpen.set(true);
  }

  // ── Series ────────────────────────────────────────────────────────────────

  abrirNuevaSerie() {
    this.formSerie = { codigo: '', serie: '', departamento_id: null };
    this.idDireccionSerie.set(null);
    this.areasAdministrativas.set([]);
    this.selectedTipoDocSerieIds.set([]);
    this.serieContextId.set(null);
    this.drawerMode.set('serie-new');
    this.drawerOpen.set(true);
  }

  abrirEditarSerie(ser: SerieItem) {
    this.formSerie = { codigo: ser.codigo, serie: ser.serie, departamento_id: ser.departamento_id ?? null };
    this.selectedTipoDocSerieIds.set((ser.tipo_documental_ids ?? []).filter((x): x is number => x !== null));
    this.serieContextId.set(ser.id);
    this.precargarCascada(
      ser.departamento_id,
      id => this.idDireccionSerie.set(id),
      v => this.cargandoAreas.set(v),
      a => this.areasAdministrativas.set(a),
    );
    this.drawerMode.set('serie-edit');
    this.drawerOpen.set(true);
  }

  toggleSerie(ser: SerieItem) {
    this.svc.toggleSerie(ser.id).subscribe({ next: () => this.cargar() });
  }

  pedirEliminarSerie(ser: SerieItem) {
    this.confirmAction.set({ id: ser.id, nombre: ser.serie, tipo: 'serie' });
  }

  // ── Subseries ─────────────────────────────────────────────────────────────

  abrirNuevaSubserie(serieId: number) {
    this.formSubserie = { codigo: '', subserie: '', id_Departamento: null };
    this.idDireccionSubserie.set(null);
    this.areasAdministrativasSub.set([]);
    this.selectedTipoDocSubserieIds.set([]);
    this.serieContextId.set(serieId);
    this.drawerMode.set('subserie-new');
    this.drawerOpen.set(true);
  }

  abrirEditarSubserie(sub: SubserieItem) {
    this.formSubserie = { codigo: sub.codigo, subserie: sub.subserie, id_Departamento: sub.id_Departamento ?? null };
    this.selectedTipoDocSubserieIds.set((sub.tipo_documental_ids ?? []).filter((x): x is number => x !== null));
    this.serieContextId.set(sub.id);
    this.precargarCascada(
      sub.id_Departamento,
      id => this.idDireccionSubserie.set(id),
      v => this.cargandoAreasSub.set(v),
      a => this.areasAdministrativasSub.set(a),
    );
    this.drawerMode.set('subserie-edit');
    this.drawerOpen.set(true);
  }

  toggleSubserie(sub: SubserieItem) {
    this.svc.toggleSubserie(sub.id).subscribe({ next: () => this.cargar() });
  }

  pedirEliminarSubserie(sub: SubserieItem) {
    this.confirmAction.set({ id: sub.id, nombre: sub.subserie, tipo: 'subserie' });
  }

  // ── Subsubseries (solo OSFEM) ─────────────────────────────────────────────

  abrirNuevaSubsubserie(sub: SubserieItem) {
    this.formSubsubserie = { codigo: '', subsubserie: '', id_departamento: null };
    this.idDireccionSubsubserie.set(null);
    this.areasAdministrativasSubsub.set([]);
    this.selectedTipoDocSubsubserieIds.set([]);
    this.subserieContextId.set(sub.id);
    this.serieContextId.set(sub.idSerie);
    this.drawerMode.set('subsubserie-new');
    this.drawerOpen.set(true);
  }

  abrirEditarSubsubserie(sss: SubsubserieItem) {
    this.formSubsubserie = { codigo: sss.codigo, subsubserie: sss.subsubserie, id_departamento: sss.id_departamento ?? null };
    this.selectedTipoDocSubsubserieIds.set((sss.tipo_documental_ids ?? []).filter((x): x is number => x !== null));
    this.subserieContextId.set(sss.id);
    this.precargarCascada(
      sss.id_departamento,
      id => this.idDireccionSubsubserie.set(id),
      v => this.cargandoAreasSubsub.set(v),
      a => this.areasAdministrativasSubsub.set(a),
    );
    this.drawerMode.set('subsubserie-edit');
    this.drawerOpen.set(true);
  }

  toggleSubsubserie(sss: SubsubserieItem) {
    this.svc.toggleSubsubserie(sss.id).subscribe({ next: () => this.cargar() });
  }

  pedirEliminarSubsubserie(sss: SubsubserieItem) {
    this.confirmAction.set({ id: sss.id, nombre: sss.subsubserie, tipo: 'subsubserie' });
  }

  // ── Drawer ────────────────────────────────────────────────────────────────

  cerrarDrawer() { this.drawerOpen.set(false); }

  get drawerTitle(): string {
    switch (this.drawerMode()) {
      case 'seccion-edit': return 'Editar Sección';
      case 'serie-new': return 'Nueva Serie';
      case 'serie-edit': return 'Editar Serie';
      case 'subserie-new': return 'Nueva Subserie';
      case 'subserie-edit': return 'Editar Subserie';
      case 'subsubserie-new': return 'Nueva Subsubserie';
      case 'subsubserie-edit': return 'Editar Subsubserie';
    }
  }

  get formularioValido(): boolean {
    const m = this.drawerMode();
    if (m === 'seccion-edit') {
      return this.formSeccion.codigo.trim().length > 0
        && this.formSeccion.seccion.trim().length > 0
        && this.formSeccion.id_tipo_seccion > 0;
    }
    if (m === 'serie-new' || m === 'serie-edit') {
      return this.formSerie.codigo.trim().length > 0 && this.formSerie.serie.trim().length > 0;
    }
    if (m === 'subsubserie-new' || m === 'subsubserie-edit') {
      return this.formSubsubserie.codigo.trim().length > 0 && this.formSubsubserie.subsubserie.trim().length > 0;
    }
    return this.formSubserie.codigo.trim().length > 0 && this.formSubserie.subserie.trim().length > 0;
  }

  guardar() {
    if (!this.formularioValido) return;
    this.guardando.set(true);
    const m = this.drawerMode();
    const onNext = () => { this.guardando.set(false); this.drawerOpen.set(false); this.cargar(); };
    const onError = () => { this.guardando.set(false); alert('Error al guardar. Intenta de nuevo.'); };

    if (m === 'seccion-edit') {
      const payload = { ...this.formSeccion, direccion_ids: this.selectedDirIds() };
      this.svc.update(this.seccionId, payload).subscribe({ next: () => onNext(), error: () => onError() });
    } else if (m === 'serie-new') {
      this.svc.createSerie({
        ...this.formSerie,
        idSeccion: this.seccionId,
        tipo_documental_ids: this.selectedTipoDocSerieIds(),
      }).subscribe({ next: () => onNext(), error: () => onError() });
    } else if (m === 'serie-edit') {
      this.svc.updateSerie(this.serieContextId()!, {
        ...this.formSerie,
        tipo_documental_ids: this.selectedTipoDocSerieIds(),
      }).subscribe({ next: () => onNext(), error: () => onError() });
    } else if (m === 'subserie-new') {
      this.svc.createSubserie({
        ...this.formSubserie,
        idSerie: this.serieContextId()!,
        tipo_documental_ids: this.selectedTipoDocSubserieIds(),
      }).subscribe({ next: () => onNext(), error: () => onError() });
    } else if (m === 'subserie-edit') {
      this.svc.updateSubserie(this.serieContextId()!, {
        ...this.formSubserie,
        tipo_documental_ids: this.selectedTipoDocSubserieIds(),
      }).subscribe({ next: () => onNext(), error: () => onError() });
    } else if (m === 'subsubserie-new') {
      this.svc.createSubsubserie({
        ...this.formSubsubserie,
        idSubserie: this.subserieContextId()!,
        idSerie: this.serieContextId()!,
        tipo_documental_ids: this.selectedTipoDocSubsubserieIds(),
      }).subscribe({ next: () => onNext(), error: () => onError() });
    } else {
      this.svc.updateSubsubserie(this.subserieContextId()!, {
        ...this.formSubsubserie,
        tipo_documental_ids: this.selectedTipoDocSubsubserieIds(),
      }).subscribe({ next: () => onNext(), error: () => onError() });
    }
  }

  // ── Confirmación eliminar ─────────────────────────────────────────────────

  cancelarConfirm() { this.confirmAction.set(null); }

  confirmarEliminar() {
    const a = this.confirmAction();
    if (!a) return;
    let op$;
    if (a.tipo === 'serie') op$ = this.svc.removeSerie(a.id);
    else if (a.tipo === 'subserie') op$ = this.svc.removeSubserie(a.id);
    else op$ = this.svc.removeSubsubserie(a.id);
    op$.subscribe({
      next: () => {
        this.confirmAction.set(null);
        if (a.tipo === 'serie') this.expandedSerieId.set(null);
        this.cargar();
      },
      error: () => alert('No se pudo eliminar.'),
    });
  }
}
