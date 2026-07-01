import { Component, OnInit, signal } from '@angular/core';
import { CadidoSevice, detalle } from '../../../services/cadido.service';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detalle',
  imports: [
    RouterLink, 
    FormsModule
  ],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css',
})
export class Detalle implements OnInit{
  cargando = signal(true);
  error = signal('');
  cadido = signal<detalle[]>([]);
  id:any;

  constructor(
    private cadidoserv: CadidoSevice,     
    private router: Router,
    private  aRouter: ActivatedRoute
  ) {
    this.id = aRouter.snapshot.paramMap.get('id');
  }

   ngOnInit(){
      if(this.id != null){
        this.cadidoserv.getcadido(this.id).subscribe({
          next: (data) => {
            this.cadido.set(data);
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
}
