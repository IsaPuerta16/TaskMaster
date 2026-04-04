import { Routes } from '@angular/router';
import { guestRoutes } from './routes/guest.routes';
import { authRoutes } from './routes/auth.routes';

/**
 * Configuración principal de rutas.
 * Segmentada en `routes/guest.routes.ts` y `routes/auth.routes.ts`.
 */
export const routes: Routes = [...guestRoutes, ...authRoutes, { path: '**', redirectTo: '' }];
