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
    sessionStorage.clear();
  });

  it('login guarda token y usuario en sessionStorage', (done) => {
    const res = {
      access_token: 'abc',
      user: {
        id: '1',
        email: 'u@test.com',
        fullName: 'Usuario',
      },
    };
    service.login('u@test.com', 'pass').subscribe(() => {
      expect(service.getToken()).toBe('abc');
      expect(service.user()?.email).toBe('u@test.com');
      expect(sessionStorage.getItem('token')).toBe('abc');
      done();
    });
    http
      .expectOne(`${environment.apiUrl}/auth/login`)
      .flush(res);
  });

  it('logout limpia sesión y navega a login', () => {
    sessionStorage.setItem('token', 'x');
    sessionStorage.setItem('user', '{}');
    service.logout();
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
