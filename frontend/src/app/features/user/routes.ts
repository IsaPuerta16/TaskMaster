import { Routes } from '@angular/router';

/**
 * Rutas de la zona privada del usuario.
 * Centraliza vistas de perfil, panel y preferencias.
 */
export const userRoutes: Routes = [
  {
    path: 'perfil',
    loadComponent: () =>
      import('../profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'mi-productividad',
    loadComponent: () =>
      import('../user-productivity/user-productividad.component').then(
        (m) => m.UserProductividadComponent,
      ),
  },
  {
    path: 'mi-asistente-ia',
    loadComponent: () =>
      import('../user-ai-assistant/user-asistente-ia.component').then(
        (m) => m.UserAsistenteIaComponent,
      ),
  },
  {
    path: 'mi-notificaciones',
    loadComponent: () =>
      import('../user-notifications/user-notificaciones.component').then(
        (m) => m.UserNotificacionesComponent,
      ),
  },
  {
    path: 'mi-configuracion',
    loadComponent: () =>
      import('../user-settings/user-configuracion.component').then(
        (m) => m.UserConfiguracionComponent,
      ),
  },
];
