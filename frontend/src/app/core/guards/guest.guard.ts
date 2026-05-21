import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AUTH_DEFAULT_ROUTE } from '@core/constants/auth-default-route';
import { AuthService } from '@core/services/auth.service';


export const guestGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return true;
  router.navigate([AUTH_DEFAULT_ROUTE]);
  return false;
};
