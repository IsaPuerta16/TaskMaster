import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

/** Redirige al panel (calendario) si el usuario ya está autenticado (landing, login, register, etc.) */
export const guestGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return true;
  router.navigate(['/dashboard']);
  return false;
};
