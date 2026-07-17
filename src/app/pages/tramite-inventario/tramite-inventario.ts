import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GuiaService, Serie } from '../../services/guia.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-tramite-inventario',
  imports: [RouterLink, FormsModule],
  templateUrl: './tramite-inventario.html',
  styleUrl: './tramite-inventario.css',
})
export class TramiteInventarioComponent implements OnInit {
  series = signal<Serie[]>([]);
  cargando = signal(true);
  error = signal('');
  busqueda = signal('');

  seriesFiltradas = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (!q) return this.series();
    return this.series()
      .map((serie) => {
        const serieCoincide = serie.codigo.toLowerCase().includes(q) || serie.serie.toLowerCase().includes(q);
        const subseries = serieCoincide
          ? serie.subseries
          : serie.subseries.filter((s) => s.codigo.toLowerCase().includes(q) || s.subserie.toLowerCase().includes(q));
        return { ...serie, subseries };
      })
      .filter((serie) => serie.codigo.toLowerCase().includes(q) || serie.serie.toLowerCase().includes(q) || serie.subseries.length > 0);
  });

  totalExpedientesVisibles = computed(() =>
    this.seriesFiltradas().reduce((acc, s) => acc + s.total_expedientes, 0),
  );

  // Un responsable puede tener a su cargo más de un departamento/dirección: se separan en pestañas.
  gruposPorDepartamento = computed(() => {
    const grupos = new Map<string, { clave: string; departamentoId: number | null; departamentoNombre: string; series: Serie[] }>();
    for (const serie of this.seriesFiltradas()) {
      const key = serie.departamento_id != null ? String(serie.departamento_id) : 'sin-departamento';
      if (!grupos.has(key)) {
        grupos.set(key, {
          clave: key,
          departamentoId: serie.departamento_id,
          departamentoNombre: serie.departamento_nombre ?? 'Sin departamento asignado',
          series: [],
        });
      }
      grupos.get(key)!.series.push(serie);
    }
    return [...grupos.values()]
      .sort((a, b) => a.departamentoNombre.localeCompare(b.departamentoNombre))
      .map((grupo) => ({
        ...grupo,
        totalExpedientes: grupo.series.reduce((acc, s) => acc + s.total_expedientes, 0),
      }));
  });

  // Acordeón: qué departamento está desplegado (null = todos cerrados)
  tabActivo = signal<string | null>(null);

  seleccionarTab(clave: string) {
    this.tabActivo.set(this.tabActivo() === clave ? null : clave);
  }

  constructor(private guia: GuiaService, private auth: AuthService) {}

  ngOnInit() {
    this.guia.getInventario(this.auth.userRfc()).subscribe({
      next: (data) => {
        this.series.set(data);
        this.cargando.set(false);
        const grupos = this.gruposPorDepartamento();
        if (grupos.length) this.tabActivo.set(grupos[0].clave);
      },
      error: (err) => {
        this.error.set('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
        this.cargando.set(false);
        console.error(err);
      },
    });
  }
}
