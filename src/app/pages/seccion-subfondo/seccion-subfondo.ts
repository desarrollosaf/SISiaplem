import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet, LowerCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  SeccionService,
  SeccionItem,
  SubfondoResumen,
  TipoSeccion,
} from '../../services/seccion.service';

type TabSec = 'sustantivas' | 'comunes';

@Component({
  selector: 'app-seccion-subfondo',
  imports: [FormsModule, NgTemplateOutlet, LowerCasePipe],
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

  drawerOpen = signal(false);
  modoEdicion = signal(false);
  idEditando = signal<number | null>(null);
  guardando = signal(false);

  form = { codigo: '', seccion: '', id_tipo_seccion: 0 };

  confirmDelete = signal<{ id: number; nombre: string } | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: SeccionService,
  ) {}

  ngOnInit() {
    this.subfondoId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar();
    this.svc.getTipoSecciones().subscribe({
      next: tipos => this.tiposSecciones.set(tipos),
      error: () => {},
    });
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
    const defaultTipo = this.tab() === 'sustantivas' ? (this.tiposSecciones()[0]?.id ?? 1) : (this.tiposSecciones()[1]?.id ?? 2);
    this.form = { codigo: '', seccion: '', id_tipo_seccion: defaultTipo };
    this.modoEdicion.set(false);
    this.idEditando.set(null);
    this.drawerOpen.set(true);
  }

  abrirEditar(item: SeccionItem) {
    this.form = {
      codigo: item.codigo,
      seccion: item.seccion,
      id_tipo_seccion: item.id_tipo_seccion,
    };
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

  get formularioValido(): boolean {
    return (
      this.form.codigo.trim().length > 0 &&
      this.form.seccion.trim().length > 0 &&
      this.form.id_tipo_seccion > 0
    );
  }

  guardar() {
    if (!this.formularioValido) return;
    this.guardando.set(true);

    const op = this.modoEdicion()
      ? this.svc.update(this.idEditando()!, this.form)
      : this.svc.create({ ...this.form, id_subfondo: this.subfondoId });

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
