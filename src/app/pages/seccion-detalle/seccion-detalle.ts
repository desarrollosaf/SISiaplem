import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  SeccionService,
  SeccionItem,
  SerieItem,
  SubserieItem,
  TipoSeccion,
  DireccionItem,
} from '../../services/seccion.service';
import { SubfondoService, SubfondoItem } from '../../services/subfondo.service';

type DrawerMode = 'serie-new' | 'serie-edit' | 'subserie-new' | 'subserie-edit' | 'seccion-edit';

interface ConfirmAction {
  id: number;
  nombre: string;
  tipo: 'serie' | 'subserie';
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

  series = computed(() => this.seccion()?.series ?? []);

  // Accordion: id de la serie expandida (null = todas cerradas)
  expandedSerieId = signal<number | null>(null);

  drawerOpen = signal(false);
  drawerMode = signal<DrawerMode>('serie-new');
  guardando = signal(false);

  serieContextId = signal<number | null>(null);

  formSerie = { codigo: '', serie: '', departamento_id: null as number | null };
  formSubserie = { codigo: '', subserie: '', id_Departamento: null as number | null };
  formSeccion = { codigo: '', seccion: '', id_tipo_seccion: 0 };
  selectedDirIds = signal<number[]>([]);

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

  cargar() {
    this.cargando.set(true);
    this.error.set('');
    this.svc.getById(this.seccionId).subscribe({
      next: sec => { this.seccion.set(sec); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo cargar la sección.'); this.cargando.set(false); },
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
    return this.direccionesOpciones().find(d => d.id === id)?.label ?? `Dir. ${id}`;
  }

  // ── Accordion ─────────────────────────────────────────────────────────────

  toggleAccordion(serieId: number) {
    this.expandedSerieId.set(this.expandedSerieId() === serieId ? null : serieId);
  }

  isExpanded(serieId: number): boolean {
    return this.expandedSerieId() === serieId;
  }

  // ── Direcciones multi-select (para sección) ───────────────────────────────

  isDirSelected(id: number): boolean {
    return this.selectedDirIds().includes(id);
  }

  toggleDir(id: number) {
    const ids = this.selectedDirIds();
    this.selectedDirIds.set(ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
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
    this.serieContextId.set(null);
    this.drawerMode.set('serie-new');
    this.drawerOpen.set(true);
  }

  abrirEditarSerie(ser: SerieItem) {
    this.formSerie = { codigo: ser.codigo, serie: ser.serie, departamento_id: ser.departamento_id ?? null };
    this.serieContextId.set(ser.id);
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
    this.serieContextId.set(serieId);
    this.drawerMode.set('subserie-new');
    this.drawerOpen.set(true);
  }

  abrirEditarSubserie(sub: SubserieItem) {
    this.formSubserie = { codigo: sub.codigo, subserie: sub.subserie, id_Departamento: sub.id_Departamento ?? null };
    this.serieContextId.set(sub.id);
    this.drawerMode.set('subserie-edit');
    this.drawerOpen.set(true);
  }

  toggleSubserie(sub: SubserieItem) {
    this.svc.toggleSubserie(sub.id).subscribe({ next: () => this.cargar() });
  }

  pedirEliminarSubserie(sub: SubserieItem) {
    this.confirmAction.set({ id: sub.id, nombre: sub.subserie, tipo: 'subserie' });
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
      this.svc.createSerie({ ...this.formSerie, idSeccion: this.seccionId })
        .subscribe({ next: () => onNext(), error: () => onError() });
    } else if (m === 'serie-edit') {
      this.svc.updateSerie(this.serieContextId()!, this.formSerie)
        .subscribe({ next: () => onNext(), error: () => onError() });
    } else if (m === 'subserie-new') {
      this.svc.createSubserie({ ...this.formSubserie, idSerie: this.serieContextId()! })
        .subscribe({ next: () => onNext(), error: () => onError() });
    } else {
      this.svc.updateSubserie(this.serieContextId()!, this.formSubserie)
        .subscribe({ next: () => onNext(), error: () => onError() });
    }
  }

  // ── Confirmación eliminar ─────────────────────────────────────────────────

  cancelarConfirm() { this.confirmAction.set(null); }

  confirmarEliminar() {
    const a = this.confirmAction();
    if (!a) return;
    const op$ = a.tipo === 'serie' ? this.svc.removeSerie(a.id) : this.svc.removeSubserie(a.id);
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
