import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  imports: [RouterLink],
  template: `
    <div class="d-flex align-items-center mb-4">
      <div>
        <h5 class="fw-bold mb-1" style="color:var(--text-dark)">{{ route.snapshot.data['title'] }}</h5>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item">
              <a routerLink="/home" style="color:var(--primary); text-decoration:none">Inicio</a>
            </li>
            <li class="breadcrumb-item text-muted">{{ route.snapshot.data['section'] }}</li>
            <li class="breadcrumb-item active text-muted">{{ route.snapshot.data['title'] }}</li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="content-card">
      <div class="text-center py-5 px-4">
        <i class="bi bi-tools placeholder-icon"></i>
        <h5 class="text-muted mb-2" style="font-size:1rem">Módulo en Desarrollo</h5>
        <p class="text-muted mb-4" style="font-size:0.85rem; max-width:380px; margin:0 auto">
          El módulo <strong>{{ route.snapshot.data['title'] }}</strong> del
          <strong>{{ route.snapshot.data['section'] }}</strong> estará disponible próximamente.
        </p>
        <a routerLink="/home" class="btn btn-primary btn-sm px-4">
          <i class="bi bi-house me-2"></i>Volver al Inicio
        </a>
      </div>
    </div>
  `
})
export class PlaceholderComponent {
  route = inject(ActivatedRoute);
}
