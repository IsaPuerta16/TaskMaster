import { Routes } from '@angular/router';
import { guestGuard } from '@core/guards/guest.guard';

/**
 * Rutas públicas del sitio.
 * Agrupa marketing y contenido visible para invitados.
 */
export const publicRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../landing/landing.component').then((m) => m.LandingComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'funcionalidades',
    loadComponent: () =>
      import('../features-page/funcionalidades.component').then(
        (m) => m.FuncionalidadesComponent,
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'productividad',
    loadComponent: () =>
      import('../productivity/productividad.component').then(
        (m) => m.ProductividadComponent,
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'asistente-ia',
    loadComponent: () =>
      import('../ai-assistant/asistente-ia.component').then(
        (m) => m.AsistenteIaComponent,
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'nosotros',
    loadComponent: () =>
      import('../about/nosotros.component').then((m) => m.NosotrosComponent),
    canActivate: [guestGuard],
  },
];
