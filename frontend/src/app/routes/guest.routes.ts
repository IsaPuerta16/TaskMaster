import { Routes } from '@angular/router';
import { guestGuard } from '../core/guards/guest.guard';

/**
 * Rutas públicas (marketing + auth invitado).
 * Carga perezosa por feature.
 */
export const guestRoutes: Routes = [
  {
    path: 'buscar',
    loadComponent: () =>
      import('../features/buscar/buscar.component').then((m) => m.BuscarComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('../features/landing/landing.component').then((m) => m.LandingComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'funcionalidades',
    loadComponent: () =>
      import('../features/funcionalidades/funcionalidades.component').then(
        (m) => m.FuncionalidadesComponent,
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'productividad',
    loadComponent: () =>
      import('../features/productividad/productividad.component').then(
        (m) => m.ProductividadComponent,
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'asistente-ia',
    loadComponent: () =>
      import('../features/asistente-ia/asistente-ia.component').then((m) => m.AsistenteIaComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'nosotros',
    loadComponent: () =>
      import('../features/nosotros/nosotros.component').then((m) => m.NosotrosComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../features/auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('../features/auth/register/register.component').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
  },
];
