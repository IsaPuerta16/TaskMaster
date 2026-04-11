import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/dashboard' } as RouterStateSnapshot;

  it('permite acceso si hay sesión', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: () => true } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    });
    const ok = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(ok).toBe(true);
    const router = TestBed.inject(Router);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirige a login con returnUrl si no hay sesión', () => {
    const navigate = jasmine.createSpy('navigate');
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: () => false } },
        { provide: Router, useValue: { navigate } },
      ],
    });
    const ok = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(ok).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/dashboard' },
    });
  });
});
