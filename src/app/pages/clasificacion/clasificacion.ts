import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { clasificacion, ClasificacionService } from '../../services/clasificacion.service';

@Component({
  selector: 'app-clasificacion',
  imports: [
    FormsModule
  ],
  templateUrl: './clasificacion.html',
  styleUrl: './clasificacion.css',
})
export class Clasificacion {
   cargando = signal(true);
    error = signal('');
    clasificacion = signal<clasificacion[]>([]);
  
    constructor(
        private clasificacionserv: ClasificacionService,     
        private router: Router,
      ) {}

      ngOnInit() {
        this.clasificacionserv.getclasificacion().subscribe({
          next: (data) => {
            this.clasificacion.set(data);
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
