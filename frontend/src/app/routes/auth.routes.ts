import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { taskRoutes } from '../features/tasks/routes';
import { userRoutes } from '../features/user/routes';


export const authRoutes: Routes = [
  ...userRoutes.map((route) => ({ ...route, canActivate: [authGuard] })),
  ...taskRoutes.map((route) => ({ ...route, canActivate: [authGuard] })),
];
