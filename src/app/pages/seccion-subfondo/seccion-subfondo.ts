import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  SeccionService,
  SeccionItem,
  SubfondoResumen,
  TipoSeccion,
  DireccionItem,
} from '../../services/seccion.service';
import { SubfondoService, SubfondoItem } from '../../services/subfondo.service';

type TabSec = 'sustantivas' | 'comunes';

@Component({
  selector: 'app-seccion-subfondo',
  imports: [FormsModule, NgTemplateOutlet],
  templateUrl: './seccion-subfondo.html',
  styleUrl: './seccion-subfondo.css',
})
export class SeccionSubfondoComponent implements OnInit {
  subfondoId = 0;
  subfondo = signal<SubfondoResumen | null>(null);
  secciones = signal<SeccionItem[]>([]);
  cargando = signal(true);
  error = signal('');

  tab = signal<TabSec>('sustantivas');

  sustantivas = computed(() => this.secciones().filter(s => s.id_tipo_seccion === 1));
  comunes = computed(() => this.secciones().filter(s => s.id_tipo_seccion === 2));

  tiposSecciones = signal<TipoSeccion[]>([]);
  subfondosOpciones = signal<SubfondoItem[]>([]);
  direccionesOpciones = signal<DireccionItem[]>([]);
  cargandoDirecciones = signal(false);

  drawerOpen = signal(false);
  modoEdicion = signal(false);
  idEditando = signal<number | null>(null);
  guardando = signal(false);

  form = { codigo: '', seccion: '', id_tipo_seccion: 0, id_subfondo: 0 };
  selectedDirIds = signal<number[]>([]);

  confirmDelete = signal<{ id: number; nombre: string } | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: SeccionService,
    private subfondoSvc: SubfondoService,
  ) {}

  ngOnInit() {
    this.subfondoId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar();
    this.svc.getTipoSecciones().subscribe({
      next: tipos => this.tiposSecciones.set(tipos),
      error: () => {},
    });
    this.subfondoSvc.getAll().subscribe({
      next: sfs => this.subfondosOpciones.set(sfs),
      error: () => {},
    });
    this.cargarDirecciones(this.subfondoId);
  }

  cargarDirecciones(subfondoId: number) {
    this.cargandoDirecciones.set(true);
    this.direccionesOpciones.set([]);
    this.svc.getDirecciones(subfondoId).subscribe({
      next: dirs => { this.direccionesOpciones.set(dirs); this.cargandoDirecciones.set(false); },
      error: () => this.cargandoDirecciones.set(false),
    });
  }

  onSubfondoChange(newId: number) {
    this.form.id_subfondo = newId;
    // Recargar direcciones según el nuevo subfondo seleccionado
    if (newId > 0) {
      this.selectedDirIds.set([]);
      this.cargarDirecciones(newId);
    }
  }

  cargar() {
    this.cargando.set(true);
    this.error.set('');
    this.svc.getBySub(this.subfondoId).subscribe({
      next: res => {
        this.subfondo.set(res.subfondo);
        this.secciones.set(res.secciones);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información.');
        this.cargando.set(false);
      },
    });
  }

  volver() {
    this.router.navigate(['/dashboard/admin/instrumentos/cgca']);
  }

  irDetalle(item: SeccionItem) {
    this.router.navigate([
      '/dashboard/admin/instrumentos/cgca/subfondo',
      this.subfondoId,
      'seccion',
      item.id,
    ]);
  }

  abrirNuevo() {
    const defaultTipo = this.tiposSecciones()[0]?.id ?? 1;
    this.form = { codigo: '', seccion: '', id_tipo_seccion: defaultTipo, id_subfondo: this.subfondoId };
    this.selectedDirIds.set([]);
    this.modoEdicion.set(false);
    this.idEditando.set(null);
    this.drawerOpen.set(true);
  }

  abrirEditar(item: SeccionItem) {
    this.form = {
      codigo: item.codigo,
      seccion: item.seccion,
      id_tipo_seccion: item.id_tipo_seccion,
      id_subfondo: item.id_subfondo,
    };
    this.selectedDirIds.set(item.direccion_ids ?? []);
    this.modoEdicion.set(true);
    this.idEditando.set(item.id);
    this.drawerOpen.set(true);
  }

  cerrarDrawer() {
    this.drawerOpen.set(false);
  }

  nombreTipo(id: number): string {
    return this.tiposSecciones().find(t => t.id === id)?.valor ?? `Tipo ${id}`;
  }

  isDirSelected(id: number): boolean {
    return this.selectedDirIds().includes(id);
  }

  toggleDir(id: number) {
    const ids = this.selectedDirIds();
    if (ids.includes(id)) {
      this.selectedDirIds.set(ids.filter(x => x !== id));
    } else {
      this.selectedDirIds.set([...ids, id]);
    }
  }

  get formularioValido(): boolean {
    return (
      this.form.codigo.trim().length > 0 &&
      this.form.seccion.trim().length > 0 &&
      this.form.id_tipo_seccion > 0 &&
      this.form.id_subfondo > 0
    );
  }

  guardar() {
    if (!this.formularioValido) return;
    this.guardando.set(true);

    const { id_subfondo, ...rest } = this.form;
    const payload = { ...rest, direccion_ids: this.selectedDirIds() };

    const op = this.modoEdicion()
      ? this.svc.update(this.idEditando()!, payload)
      : this.svc.create({ ...payload, id_subfondo });

    op.subscribe({
      next: () => {
        this.guardando.set(false);
        this.drawerOpen.set(false);
        this.cargar();
      },
      error: () => {
        this.guardando.set(false);
        alert('Error al guardar. Intenta de nuevo.');
      },
    });
  }

  toggleStatus(item: SeccionItem) {
    this.svc.toggleStatus(item.id).subscribe({
      next: () => this.cargar(),
      error: () => alert('Error al cambiar el estatus.'),
    });
  }

  pedirEliminar(item: SeccionItem) {
    this.confirmDelete.set({ id: item.id, nombre: item.seccion });
  }

  cancelarEliminar() {
    this.confirmDelete.set(null);
  }

  confirmarEliminar() {
    const d = this.confirmDelete();
    if (!d) return;
    this.svc.remove(d.id).subscribe({
      next: () => {
        this.confirmDelete.set(null);
        this.cargar();
      },
      error: () => alert('No se pudo eliminar la sección.'),
    });
  }
}
