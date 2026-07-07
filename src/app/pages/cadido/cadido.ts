import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CadidoSevice, CadidoInt, SubfondoItem } from '../../services/cadido.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-cadido',
  imports: [FormsModule],
  templateUrl: './cadido.html',
  styleUrl: './cadido.css',
})
export class Cadido implements OnInit {
  cargando = signal(true);
  error = signal('');
  subfondos = signal<CadidoInt[]>([]);
  constructor(
    private cadidoserv: CadidoSevice,     
    private router: Router,
  ) {}

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

  abrirDetalle(item: CadidoInt) {
      this.router.navigate(['/control/cadido/detalle', item.id]);
    }
}
