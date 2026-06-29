import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas con parámetros dinámicos → client-side rendering
  { path: 'dashboard/tramite/expedientes/serie/:id',    renderMode: RenderMode.Client },
  { path: 'dashboard/tramite/expedientes/subserie/:id', renderMode: RenderMode.Client },
  { path: 'dashboard/tramite/expediente/:id',           renderMode: RenderMode.Client },
  // Todo lo demás → prerenderizar
  { path: '**', renderMode: RenderMode.Prerender },
];
