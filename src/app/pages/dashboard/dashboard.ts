import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AvisosService, Aviso } from '../../services/avisos.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  protected avisosSvc = inject(AvisosService);

  currentTime = signal('');
  currentDate = signal('');
  greeting = signal('Buenos días');
  avisosRecientes = signal<Aviso[]>([]);

  private clockInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
    this.avisosSvc.getRecientes(4).subscribe({ next: (data) => this.avisosRecientes.set(data) });
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
