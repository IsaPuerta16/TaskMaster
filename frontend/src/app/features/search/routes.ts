import { Routes } from '@angular/router';

export const buscarRoutes: Routes = [
  {
    path: 'buscar',
    loadComponent: () =>
      import('./buscar.component').then((m) => m.BuscarComponent),
  },
];
