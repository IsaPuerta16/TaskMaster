import { Routes } from '@angular/router';
import { guestRoutes } from './routes/guest.routes';
import { authRoutes } from './routes/auth.routes';

export const routes: Routes = [...guestRoutes, ...authRoutes, { path: '**', redirectTo: '' }];
