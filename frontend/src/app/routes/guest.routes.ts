import { Routes } from '@angular/router';
import { authFeatureRoutes } from '../features/auth/routes';
import { buscarRoutes } from '../features/search/routes';
import { publicRoutes } from '../features/public/routes';


export const guestRoutes: Routes = [
  ...buscarRoutes,
  ...publicRoutes,
  ...authFeatureRoutes,
];
