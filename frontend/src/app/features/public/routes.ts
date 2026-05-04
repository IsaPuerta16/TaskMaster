import { Routes } from '@angular/router';

/**
 * Rutas públicas del sitio (marketing e información).
 * Visibles con o sin sesión; login/register siguen usando `guestGuard` en su feature.
 */
export const publicRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'funcionalidades',
    loadComponent: () =>
      import('../features-page/funcionalidades.component').then(
        (m) => m.FuncionalidadesComponent,
      ),
  },
  {
    path: 'productividad',
    loadComponent: () =>
      import('../productivity/productividad.component').then(
        (m) => m.ProductividadComponent,
      ),
  },
  {
    path: 'asistente-ia',
    loadComponent: () =>
      import('../ai-assistant/asistente-ia.component').then(
        (m) => m.AsistenteIaComponent,
      ),
  },
  {
    path: 'nosotros',
    loadComponent: () =>
      import('../about/nosotros.component').then((m) => m.NosotrosComponent),
  },
];
