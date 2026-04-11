import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { taskRoutes } from '../features/tasks/routes';
import { userRoutes } from '../features/user/routes';

/**
 * Rutas privadas (área de usuario y tareas).
 * Todas exigen sesión vía authGuard.
 */
export const authRoutes: Routes = [
  ...userRoutes.map((route) => ({ ...route, canActivate: [authGuard] })),
  ...taskRoutes.map((route) => ({ ...route, canActivate: [authGuard] })),
];
