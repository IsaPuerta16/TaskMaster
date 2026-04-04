import { Routes } from '@angular/router';

/**
 * Rutas de la app (dashboard, tareas).
 * Sin authGuard por ahora: accesibles sin iniciar sesión.
 */
export const authRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
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
