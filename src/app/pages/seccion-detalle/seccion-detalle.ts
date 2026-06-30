import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  SeccionService,
  SeccionItem,
  SerieItem,
  SubserieItem,
  TipoSeccion,
} from '../../services/seccion.service';

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
  cargando = signal(true);
  error = signal('');

  tiposSecciones = signal<TipoSeccion[]>([]);

  // Tab seleccionada: 'info' o id de la serie (string)
  tabActiva = signal<string>('info');

  series = computed(() => this.seccion()?.series ?? []);
  seriesActivas = computed(() => this.series().filter(s => s.status === 1).length);

  drawerOpen = signal(false);
  drawerMode = signal<DrawerMode>('serie-new');
  guardando = signal(false);

  // Contexto del drawer
  serieContextId = signal<number | null>(null); // para subseries: id del padre

  formSerie = { codigo: '', serie: '' };
  formSubserie = { codigo: '', subserie: '' };
  formSeccion = { codigo: '', seccion: '', id_tipo_seccion: 0 };

  confirmAction = signal<ConfirmAction | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: SeccionService,
  ) {}

  ngOnInit() {
    this.subfondoId = Number(this.route.snapshot.paramMap.get('subfondoId'));
    this.seccionId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar();
    this.svc.getTipoSecciones().subscribe({
      next: t => this.tiposSecciones.set(t),
      error: () => {},
    });
  }

  cargar() {
    this.cargando.set(true);
    this.error.set('');
    this.svc.getById(this.seccionId).subscribe({
      next: sec => {
        this.seccion.set(sec);
        if (sec.series && sec.series.length > 0 && this.tabActiva() === 'info') {
          // mantener tab info al cargar
        }
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la sección.');
        this.cargando.set(false);
      },
    });
  }

  volver() {
    this.router.navigate(['/dashboard/admin/instrumentos/cgca/subfondo', this.subfondoId]);
  }

  nombreTipo(id: number): string {
    return this.tiposSecciones().find(t => t.id === id)?.valor ?? `Tipo ${id}`;
  }

  serieDeTab(tabId: string): SerieItem | undefined {
    if (tabId === 'info') return undefined;
    return this.series().find(s => String(s.id) === tabId);
  }

  // ── Sección info ──────────────────────────────────────────────────────────

  abrirEditarSeccion() {
    const s = this.seccion();
    if (!s) return;
    this.formSeccion = { codigo: s.codigo, seccion: s.seccion, id_tipo_seccion: s.id_tipo_seccion };
    this.drawerMode.set('seccion-edit');
    this.drawerOpen.set(true);
  }

  // ── Series ────────────────────────────────────────────────────────────────

  abrirNuevaSerie() {
    this.formSerie = { codigo: '', serie: '' };
    this.drawerMode.set('serie-new');
    this.drawerOpen.set(true);
  }

  abrirEditarSerie(ser: SerieItem) {
    this.formSerie = { codigo: ser.codigo, serie: ser.serie };
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
    this.formSubserie = { codigo: '', subserie: '' };
    this.serieContextId.set(serieId);
    this.drawerMode.set('subserie-new');
    this.drawerOpen.set(true);
  }

  abrirEditarSubserie(sub: SubserieItem) {
    this.formSubserie = { codigo: sub.codigo, subserie: sub.subserie };
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
      return this.formSeccion.codigo.trim().length > 0 && this.formSeccion.seccion.trim().length > 0 && this.formSeccion.id_tipo_seccion > 0;
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
      this.svc.update(this.seccionId, this.formSeccion)
        .subscribe({ next: () => onNext(), error: () => onError() });
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
        if (a.tipo === 'serie') this.tabActiva.set('info');
        this.cargar();
      },
      error: () => alert('No se pudo eliminar.'),
    });
  }
}
