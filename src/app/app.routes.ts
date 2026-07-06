import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

const PH = (title: string, section: string) => ({ title, section });

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent)
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent)
      },

      /* ── Archivo de Trámite ── */
      {
        path: 'tramite/inventario',
        loadComponent: () => import('./pages/tramite-inventario/tramite-inventario').then(m => m.TramiteInventarioComponent)
      },
      {
        path: 'tramite/expedientes',
        loadComponent: () => import('./pages/tramite-expedientes/tramite-expedientes').then(m => m.TramiteExpedientesComponent),
        data: { tipo: 'activos' }
      },
      {
        path: 'tramite/expedientes-cerrados',
        loadComponent: () => import('./pages/tramite-expedientes/tramite-expedientes').then(m => m.TramiteExpedientesComponent),
        data: { tipo: 'cerrados' }
      },
      {
        path: 'tramite/expedientes/serie/:id',
        loadComponent: () => import('./pages/tramite-expedientes/tramite-expedientes').then(m => m.TramiteExpedientesComponent),
        data: { tipo: 'serie' }
      },
      {
        path: 'tramite/expedientes/subserie/:id',
        loadComponent: () => import('./pages/tramite-expedientes/tramite-expedientes').then(m => m.TramiteExpedientesComponent),
        data: { tipo: 'subserie' }
      },
      { path: 'tramite/nuevo-expediente', loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent), data: PH('Nuevo Expediente', 'Archivo de Trámite') },
      { path: 'tramite/prestamos',        loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent), data: PH('Consultas y Préstamos', 'Archivo de Trámite') },
      { path: 'tramite/transferencias',   loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent), data: PH('Transferencia Primaria', 'Archivo de Trámite') },
      { path: 'tramite/expediente/:id',   loadComponent: () => import('./pages/tramite-expediente-detalle/tramite-expediente-detalle').then(m => m.TramiteExpedienteDetalleComponent) },

      /* ── Archivo de Concentración ── */
      { path: 'concentracion/expedientes',   loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent), data: PH('Expedientes Recibidos', 'Archivo de Concentración') },
      { path: 'concentracion/prestamos',     loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent), data: PH('Préstamos', 'Archivo de Concentración') },
      { path: 'concentracion/baja',          loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent), data: PH('Baja Documental', 'Archivo de Concentración') },
      { path: 'concentracion/transferencias',loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent), data: PH('Transferencia al Histórico', 'Archivo de Concentración') },

      /* ── Archivo Histórico ── */
      { path: 'historico/fondos',         loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent), data: PH('Fondo Documental', 'Archivo Histórico') },
      { path: 'historico/consulta',       loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent), data: PH('Consulta Pública', 'Archivo Histórico') },
      { path: 'historico/digitalizacion', loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent), data: PH('Digitalización', 'Archivo Histórico') },
      { path: 'historico/conservacion',   loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent), data: PH('Conservación y Restauración', 'Archivo Histórico') },

      /* ── Administración ── */
      { path: 'admin/instrumentos/cgca', loadComponent: () => import('./pages/cgca-subfondo/cgca-subfondo').then(m => m.CgcaSubfondoComponent) },
      { path: 'admin/responsables/directorio', loadComponent: () => import('./pages/responsables/responsables').then(m => m.ResponsablesComponent) },
      { path: 'admin/instrumentos/cgca/subfondo/:id', loadComponent: () => import('./pages/seccion-subfondo/seccion-subfondo').then(m => m.SeccionSubfondoComponent) },
      { path: 'admin/instrumentos/cgca/subfondo/:subfondoId/seccion/:id', loadComponent: () => import('./pages/seccion-detalle/seccion-detalle').then(m => m.SeccionDetalleComponent) },
      { path: 'admin/usuarios',     loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent), data: PH('Usuarios y Roles', 'Administración') },
      { path: 'admin/catalogos',    loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent), data: PH('Catálogos', 'Administración') },
      { path: 'admin/series',       loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent), data: PH('Series Documentales', 'Administración') },
      { path: 'admin/configuracion',loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent), data: PH('Configuración', 'Administración') },
      { path: 'control/cadido', loadComponent: () => import('./pages/cadido/cadido').then(m => m.Cadido), data: PH('Cadido', 'Administración') },
      { path: 'control/cadido/detalle/:id', loadComponent: () => import('./pages/cadido/detalle/detalle').then(m => m.Detalle)},

      /* ── Herramientas ── */
      { path: 'reportes', loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent), data: PH('Reportes y Estadísticas', 'Herramientas') },
      { path: 'ayuda',    loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.PlaceholderComponent), data: PH('Ayuda y Soporte', 'Herramientas') },
    ]
  },

  { path: '**', redirectTo: '/login' }
];
