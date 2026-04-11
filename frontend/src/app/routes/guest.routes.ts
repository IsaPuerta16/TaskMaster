import { Routes } from '@angular/router';
import { authFeatureRoutes } from '../features/auth/routes';
import { buscarRoutes } from '../features/search/routes';
import { publicRoutes } from '../features/public/routes';

/**
 * Rutas públicas (marketing + auth invitado).
 * Carga perezosa por feature.
 */
export const guestRoutes: Routes = [
  ...buscarRoutes,
  ...publicRoutes,
  ...authFeatureRoutes,
];
