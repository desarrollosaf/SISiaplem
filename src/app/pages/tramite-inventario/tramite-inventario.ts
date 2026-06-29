import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuiaService, Serie } from '../../services/guia.service';

@Component({
  selector: 'app-tramite-inventario',
  imports: [RouterLink],
  templateUrl: './tramite-inventario.html',
  styleUrl: './tramite-inventario.css',
})
export class TramiteInventarioComponent implements OnInit {
  series = signal<Serie[]>([]);
  cargando = signal(true);
  error = signal('');

  // RFC temporal hasta integrar auth — reemplazar con el usuario real
  private RFC_TEMP = 'SAGM990220';

  constructor(private guia: GuiaService) {}

  ngOnInit() {
    this.guia.getInventario(this.RFC_TEMP).subscribe({
      next: (data) => {
        this.series.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
        this.cargando.set(false);
        console.error(err);
      },
    });
  }
}
