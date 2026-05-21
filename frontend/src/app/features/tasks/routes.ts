import { Routes } from '@angular/router';


export const taskRoutes: Routes = [
  {
    path: 'tasks',
    loadComponent: () =>
      import('./task-list/task-list.component').then((m) => m.TaskListComponent),
  },
  {
    path: 'tasks/new',
    loadComponent: () =>
      import('./task-form/task-form.component').then((m) => m.TaskFormComponent),
  },
  {
    path: 'tasks/:id/edit',
    loadComponent: () =>
      import('./task-form/task-form.component').then((m) => m.TaskFormComponent),
  },
];
