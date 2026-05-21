import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, switchMap } from 'rxjs';
import { environment } from '@env/environment';
import type { User, AuthResponse } from '@core/models';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';


const storage =
  typeof localStorage !== 'undefined' ? localStorage : sessionStorage;

function readStoredAuth(): { token: string | null; user: User | null } {
  let token = storage.getItem(TOKEN_KEY);
  let userRaw = storage.getItem(USER_KEY);
  if (!token && typeof sessionStorage !== 'undefined') {
    token = sessionStorage.getItem(TOKEN_KEY);
    userRaw = sessionStorage.getItem(USER_KEY);
    if (token) {
      storage.setItem(TOKEN_KEY, token);
      if (userRaw) storage.setItem(USER_KEY, userRaw);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    }
  }
  let user: User | null = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw) as User;
    } catch {
      user = null;
    }
  }
  return { token, user };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly stored = readStoredAuth();
  private token = signal<string | null>(this.stored.token);
  private userData = signal<User | null>(this.stored.user);

  user = computed(() => this.userData());
  isAuthenticated = computed(() => !!this.token());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    if (this.token()) {
      this.syncProfileFromServer();
    }
  }

  
  private syncProfileFromServer(): void {
    this.http.get<User>(`${environment.apiUrl}/users/me`).subscribe({
      next: (user) => this.setUser(user),
      error: () => this.clearSession(),
    });
  }

  checkEmailAvailable(email: string) {
    const normalized = email.trim().toLowerCase();
    return this.http.get<{ available: boolean }>(
      `${environment.apiUrl}/auth/check-email`,
      { params: { email: normalized } },
    );
  }

  register(email: string, password: string, fullName: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, {
        email: email.trim().toLowerCase(),
        password,
        fullName: fullName.trim(),
      })
      .pipe(switchMap((res) => this.finishAuth(res)));
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
        email: email.trim().toLowerCase(),
        password,
      })
      .pipe(switchMap((res) => this.finishAuth(res)));
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/forgot-password`,
      { email: email.trim().toLowerCase() },
    );
  }

  resetPassword(token: string, password: string) {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/reset-password`,
      { token, password },
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  
  logoutWithReturnUrl(returnUrl: string): void {
    this.clearSession();
    this.router.navigate(['/login'], { queryParams: { returnUrl } });
  }

  private clearSession(): void {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(USER_KEY);
    this.token.set(null);
    this.userData.set(null);
  }

  
  private finishAuth(res: AuthResponse) {
    this.setSession(res);
    return this.http.get<User>(`${environment.apiUrl}/users/me`).pipe(
      tap((user) => this.setUser(user)),
    );
  }

  private setSession(res: AuthResponse) {
    storage.setItem(TOKEN_KEY, res.access_token);
    storage.setItem(USER_KEY, JSON.stringify(res.user));
    this.token.set(res.access_token);
    this.userData.set(res.user);
  }

  setUser(user: User): void {
    storage.setItem(USER_KEY, JSON.stringify(user));
    this.userData.set(user);
  }

  getToken() {
    return this.token();
  }
}
