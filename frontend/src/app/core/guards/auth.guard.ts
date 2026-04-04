import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { environment } from '@env/environment';

export const authGuard = () => {
  // TODO: quitar cuando el backend esté conectado
  if (!environment.production) return true;

  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  router.navigate(['/']);
  return false;
};
