import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

/**
 * Rutas protegidas (usuario autenticado).
 */
export const authRoutes: Routes = [
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
