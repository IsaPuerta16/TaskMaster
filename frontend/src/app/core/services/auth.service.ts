import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '@env/environment.prod';
import type { User, AuthResponse } from '@core/models';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token = signal<string | null>(sessionStorage.getItem(TOKEN_KEY));
  private userData = signal<User | null>(this.getStoredUser());

  user = computed(() => this.userData());
  isAuthenticated = computed(() => !!this.token());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  register(email: string, password: string, fullName: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, {
        email,
        password,
        fullName,
      })
      .pipe(tap((res) => this.setSession(res)));
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  /** Tras 401: limpiar sesión y volver al login conservando la ruta para reintentar. */
  logoutWithReturnUrl(returnUrl: string): void {
    this.clearSession();
    this.router.navigate(['/login'], { queryParams: { returnUrl } });
  }

  private clearSession(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.userData.set(null);
  }

  private setSession(res: AuthResponse) {
    sessionStorage.setItem(TOKEN_KEY, res.access_token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.token.set(res.access_token);
    this.userData.set(res.user);
  }

  setUser(user: User): void {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userData.set(user);
  }

  private getStoredUser(): User | null {
    const stored = sessionStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  getToken() {
    return this.token();
  }
}
