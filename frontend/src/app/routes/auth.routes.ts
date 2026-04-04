import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

/**
 * Rutas protegidas (usuario autenticado).
 */
export const authRoutes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('../features/home/home.component').then((m) => m.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('../features/perfil/perfil.component').then((m) => m.PerfilComponent),
    canActivate: [authGuard],
  },
  {
    path: 'notificaciones',
    loadComponent: () =>
      import('../features/notificaciones/notificaciones.component').then((m) => m.NotificacionesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'configuracion',
    loadComponent: () =>
      import('../features/configuracion/configuracion.component').then((m) => m.ConfiguracionComponent),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('../features/tasks/task-list/task-list.component').then((m) => m.TaskListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'tasks/new',
    loadComponent: () =>
      import('../features/tasks/task-form/task-form.component').then((m) => m.TaskFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'tasks/:id/edit',
    loadComponent: () =>
      import('../features/tasks/task-form/task-form.component').then((m) => m.TaskFormComponent),
    canActivate: [authGuard],
  },
];
