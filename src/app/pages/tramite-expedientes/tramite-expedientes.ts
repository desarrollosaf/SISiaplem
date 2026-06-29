import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GuiaService, Expediente } from '../../services/guia.service';

declare const bootstrap: any;

@Component({
  selector: 'app-tramite-expedientes',
  imports: [RouterLink],
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

  nuevoNombre = '';
  nuevoAnio = String(new Date().getFullYear());
  guardando = false;

  private RFC_TEMP = 'SAGM990220';

  constructor(
    private route: ActivatedRoute,
    private guia: GuiaService,
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
    } else if (tipo === 'subserie') {
      this.tipo = 'subserie';
      this.guia.getSubserie(this.idParam).subscribe((s) => {
        if (s) { this.titulo.set(`${s.codigo} – ${s.subserie}`); this.subtitulo.set(`${s.serie_codigo} ${s.serie_nombre} › Subserie`); }
      });
      this.cargar(() => this.guia.getExpedientesSubserie(this.idParam));
    } else if (tipo === 'cerrados') {
      this.tipo = 'cerrados';
      this.titulo.set('Expedientes Cerrados');
      this.subtitulo.set('Todos los expedientes con fecha de cierre registrada');
      this.cargar(() => this.guia.getCerrados(this.RFC_TEMP));
    } else {
      this.tipo = 'activos';
      this.titulo.set('Expedientes Abiertos');
      this.subtitulo.set('Todos los expedientes activos sin fecha de cierre');
      this.cargar(() => this.guia.getActivos(this.RFC_TEMP));
    }
  }

  private cargar(fn: () => any) {
    fn().subscribe({
      next: (data: Expediente[]) => { this.expedientes.set(data); this.cargando.set(false); },
      error: (e: any) => { this.error.set('Error al cargar expedientes. Verifica que el backend esté corriendo.'); this.cargando.set(false); console.error(e); },
    });
  }

  guardarExpediente() {
    if (!this.nuevoNombre.trim() || !this.nuevoAnio) return;
    this.guardando = true;
    const dto = {
      ...(this.tipo === 'serie' ? { id_serie: this.idParam } : { id_subserie: this.idParam }),
      nombre_ex: this.nuevoNombre.trim(),
      anio: this.nuevoAnio,
    };
    this.guia.crearExpediente(dto).subscribe({
      next: (exp) => {
        this.expedientes.update((list) => [exp, ...list]);
        this.nuevoNombre = '';
        this.nuevoAnio = String(new Date().getFullYear());
        this.guardando = false;
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalNuevoExp'));
        modal?.hide();
      },
      error: (e) => { this.guardando = false; console.error(e); },
    });
  }

  cerrarExpediente(id: number) {
    if (!confirm('¿Está seguro de cerrar este expediente?')) return;
    this.guia.cerrarExpediente(id).subscribe({
      next: () => {
        this.expedientes.update((list) =>
          list.map((e) => e.id === id ? { ...e, fecha_cierre_exp: new Date().toISOString().slice(0, 10) } : e),
        );
      },
      error: (e) => console.error(e),
    });
  }

  estaAbierto(exp: Expediente) { return exp.fecha_cierre_exp == null; }

  serieLabel(exp: Expediente): string {
    if (exp.subserie_codigo) return `${exp.subserie_codigo} ${exp.subserie_nombre}`;
    if (exp.serie_codigo) return `${exp.serie_codigo} ${exp.serie_nombre}`;
    return '—';
  }
}
