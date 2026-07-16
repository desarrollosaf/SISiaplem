import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AvisosService, Aviso } from '../../services/avisos.service';
import { AuthService } from '../../services/auth.service';
import { GuiaService, ActividadReciente } from '../../services/guia.service';
import { ConsultasService, SolicitudPorVencer } from '../../services/consultas.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  protected avisosSvc = inject(AvisosService);
  protected auth = inject(AuthService);
  protected guiaSvc = inject(GuiaService);
  protected consultasSvc = inject(ConsultasService);

  currentTime = signal('');
  currentDate = signal('');
  greeting = signal('Buenos días');
  avisosRecientes = signal<Aviso[]>([]);
  actividadReciente = signal<ActividadReciente[]>([]);
  porVencer = signal<SolicitudPorVencer[]>([]);

  // La actividad reciente es de Archivo de Trámite: no aplica para RAC/RAH (solo Concentración/Histórico)
  mostrarActividad = computed(() => {
    const roles = this.auth.roles();
    return roles.includes('RAT') || roles.includes('ADMIM');
  });

  private clockInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
    this.avisosSvc.getRecientes(6).subscribe({ next: (data) => this.avisosRecientes.set(data) });

    const rfc = this.auth.userRfc();
    if (rfc && this.mostrarActividad()) {
      this.guiaSvc.getActividadReciente(rfc, 6).subscribe({ next: (data) => this.actividadReciente.set(data) });
    }

    if (this.auth.hasRole('RAC')) {
      this.consultasSvc.getPorVencer(7).subscribe({ next: (data) => this.porVencer.set(data) });
    }
  }

  ngOnDestroy() {
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  private updateClock() {
    const now = new Date();
    const h = now.getHours();
    this.currentTime.set(now.toLocaleTimeString('es-MX', { hour12: false }));
    this.currentDate.set(
      now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    );
    if (h < 12) this.greeting.set('Buenos días');
    else if (h < 19) this.greeting.set('Buenas tardes');
    else this.greeting.set('Buenas noches');
  }
}
