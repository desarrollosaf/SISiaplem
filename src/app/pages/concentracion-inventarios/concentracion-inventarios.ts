import { Component } from '@angular/core';
import { ConcentracionService } from '../../services/concentracion.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-concentracion-inventarios',
  imports: [],
  templateUrl: './concentracion-inventarios.html',
  styleUrl: './concentracion-inventarios.css',
})
export class ConcentracionInventariosComponent {
  constructor(private concentracion: ConcentracionService, private auth: AuthService) {}

  descargarBajaDocumental() {
    window.open(this.concentracion.getBajaDocumentalUrl(this.auth.userRfc()), '_blank');
  }

  descargarInventarioGeneral() {
    window.open(this.concentracion.getInventarioGeneralUrl(this.auth.userRfc()), '_blank');
  }

  descargarTransferenciaSecundaria() {
    window.open(this.concentracion.getTransferenciaSecundariaUrl(this.auth.userRfc()), '_blank');
  }

  descargarCalendarioCaducidades() {
    window.open(this.concentracion.getCalendarioCaducidadesUrl(this.auth.userRfc()), '_blank');
  }
}
