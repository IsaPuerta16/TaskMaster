import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
import { AUTH_DEFAULT_ROUTE } from '@core/constants/auth-default-route';
import { AuthService } from '@core/services/auth.service';
import { safeInternalPath } from '@core/utils/return-url';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-page__main">
        <div class="login-card">
          <h1 class="login-card__brand">TaskMaster</h1>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form" novalidate>
            <div class="login-field">
              <span class="login-field__icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <label class="sr-only" for="login-email">Correo electrónico</label>
              <input
                id="login-email"
                type="email"
                formControlName="email"
                placeholder="Correo electrónico"
                autocomplete="email"
              />
            </div>
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <span class="login-error">Introduce un correo válido (ej. nombre&#64;correo.com)</span>
            }

            <div class="login-field">
              <span class="login-field__icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <label class="sr-only" for="login-password">Contraseña</label>
              <input
                id="login-password"
                type="password"
                formControlName="password"
                placeholder="Contraseña"
                autocomplete="current-password"
              />
            </div>
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="login-error">Mínimo 6 caracteres</span>
            }

            <a class="login-forgot" routerLink="/forgot-password">¿Olvidaste tu contraseña?</a>

            @if (errorMessage) {
              <div class="login-alert" role="alert">{{ errorMessage }}</div>
            }

            <button type="submit" class="login-btn" [disabled]="loading">
              {{ loading ? 'Entrando...' : 'Inicia sesión' }}
            </button>
          </form>

          <p class="login-register">
            ¿No tienes una cuenta?
            <a routerLink="/register">Regístrate aquí</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.auth
      .login(this.form.value.email.trim(), this.form.value.password)
      .subscribe({
        next: () => {
          const ret = safeInternalPath(this.route.snapshot.queryParamMap.get('returnUrl'));
          void this.router.navigateByUrl(
            ret ?? AUTH_DEFAULT_ROUTE,
            { replaceUrl: true },
          );
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = this.parseLoginError(err);
          this.loading = false;
        },
        complete: () => (this.loading = false),
      });
  }

  private parseLoginError(err: HttpErrorResponse): string {
    const raw = err.error as { message?: string | string[] } | null;
    const msg = Array.isArray(raw?.message)
      ? raw.message.join('. ')
      : typeof raw?.message === 'string'
        ? raw.message
        : '';
    if (/email must be an email/i.test(msg)) {
      return 'Introduce un correo válido (ejemplo: nombre@correo.com).';
    }
    if (/password.*6|too short/i.test(msg)) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (err.status === 401 || /invalid|credencial|unauthorized/i.test(msg)) {
      return 'Correo o contraseña incorrectos.';
    }
    if (msg) return msg;
    if (err.status === 0) {
      return 'No hay conexión con el servidor.';
    }
    return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
  }
}
