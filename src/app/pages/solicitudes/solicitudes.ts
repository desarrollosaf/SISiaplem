import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClasificacionService, solicitudesI } from '../../services/clasificacion.service';
import { Solicitud } from '../clasificacion/solicitud/solicitud';


@Component({
  selector: 'app-solicitudes',
  imports: [
    FormsModule
  ],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.css',
})
export class Solicitudes {
    cargando = signal(true);
    error = signal('');
    solicitudes = signal<solicitudesI[]>([]);

    constructor(
      private clasificacionserv: ClasificacionService,     
      private router: Router,
    ) {}
    
     ngOnInit() {
      this.clasificacionserv.getSolicitudesAdmin().subscribe({
          next: (data) => {
            console.log('data ', data);
            this.solicitudes.set(data);
            this.cargando.set(false);
          },
          error: (err) => {
            this.error.set('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
            this.cargando.set(false);
            console.error(err);
          },
      })
    }



}
