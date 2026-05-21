import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '@env/environment';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  const router = { navigate: jasmine.createSpy('navigate') };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, { provide: Router, useValue: router }],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('login guarda token y usuario en localStorage y refresca perfil', (done) => {
    const res = {
      access_token: 'abc',
      user: {
        id: '1',
        email: 'u@test.com',
        fullName: 'Usuario',
      },
    };
    const profile = { ...res.user, firstName: 'Usuario', lastName: '' };

    service.login('u@test.com', 'pass').subscribe((user) => {
      expect(service.getToken()).toBe('abc');
      expect(user.email).toBe('u@test.com');
      expect(localStorage.getItem('token')).toBe('abc');
      done();
    });

    http.expectOne(`${environment.apiUrl}/auth/login`).flush(res);
    http.expectOne(`${environment.apiUrl}/users/me`).flush(profile);
  });

  it('logout limpia sesión y navega a login', () => {
    localStorage.setItem('token', 'x');
    localStorage.setItem('user', '{}');
    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
