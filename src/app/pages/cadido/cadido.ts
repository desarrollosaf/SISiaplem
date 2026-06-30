import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CadidoSevice, CadidoInt } from '../../services/cadido.service';

@Component({
  selector: 'app-cadido',
  imports: [RouterLink],
  templateUrl: './cadido.html',
  styleUrl: './cadido.css',
})
export class Cadido implements OnInit {
  cargando = signal(true);
  error = signal('');
  subfondos = signal<CadidoInt[]>([]);
  constructor(private cadidoserv: CadidoSevice) {}

   ngOnInit() {
    this.cadidoserv.getsubfondos().subscribe({
      next: (data) => {
        this.subfondos.set(data);
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
