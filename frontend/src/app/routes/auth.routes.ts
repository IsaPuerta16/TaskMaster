import { Routes } from '@angular/router';

/**
 * Rutas de la app (dashboard, tareas).
 * Sin authGuard por ahora: accesibles sin iniciar sesión.
 */
export const authRoutes: Routes = [
  {
    path: 'perfil',
    loadComponent: () =>
      import('../features/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'mi-productividad',
    loadComponent: () =>
      import('../features/user-productividad/user-productividad.component').then(
        (m) => m.UserProductividadComponent,
      ),
  },
  {
    path: 'mi-asistente-ia',
    loadComponent: () =>
      import('../features/user-asistente-ia/user-asistente-ia.component').then(
        (m) => m.UserAsistenteIaComponent,
      ),
  },
  {
    path: 'mi-notificaciones',
    loadComponent: () =>
      import('../features/user-notificaciones/user-notificaciones.component').then(
        (m) => m.UserNotificacionesComponent,
      ),
  },
  {
    path: 'mi-configuracion',
    loadComponent: () =>
      import('../features/user-configuracion/user-configuracion.component').then(
        (m) => m.UserConfiguracionComponent,
      ),
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('../features/tasks/task-list/task-list.component').then((m) => m.TaskListComponent),
  },
  {
    path: 'tasks/new',
    loadComponent: () =>
      import('../features/tasks/task-form/task-form.component').then((m) => m.TaskFormComponent),
  },
  {
    path: 'tasks/:id/edit',
    loadComponent: () =>
      import('../features/tasks/task-form/task-form.component').then((m) => m.TaskFormComponent),
  },
];
