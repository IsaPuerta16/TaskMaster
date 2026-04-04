import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { safeInternalPath } from '@core/utils/return-url';
import { HeaderComponent } from '@shared/layout';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HeaderComponent],
  template: `
    <div class="login-page">
      <app-header />

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
                placeholder="Correo Electronico"
                autocomplete="email"
              />
            </div>
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <span class="login-error">Correo inválido</span>
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

            <a class="login-forgot" href="#" (click)="$event.preventDefault()">¿Olvidaste tu contraseña?</a>

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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.auth
      .login(this.form.value.email, this.form.value.password)
      .subscribe({
        next: () => {
          const ret = safeInternalPath(this.route.snapshot.queryParamMap.get('returnUrl'));
          void this.router.navigateByUrl(ret ?? '/dashboard', { replaceUrl: true });
        },
        error: (err: { error?: { message?: string } }) => {
          this.errorMessage = err.error?.message || 'Credenciales inválidas';
          this.loading = false;
        },
        complete: () => (this.loading = false),
      });
  }
}
