import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { HeaderComponent } from '@shared/layout';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HeaderComponent],
  template: `
    <div class="register-page">
      <app-header />

      <div class="register-page__main">
        <div class="register-card">
          <h1 class="register-card__brand">TaskMaster</h1>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="register-form" novalidate>
            <div class="register-field">
              <span class="register-field__icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <label class="sr-only" for="register-name">Nombre</label>
              <input
                id="register-name"
                type="text"
                formControlName="fullName"
                placeholder="Nombre"
                autocomplete="name"
              />
            </div>
            @if (form.get('fullName')?.invalid && form.get('fullName')?.touched) {
              <span class="register-error">Mínimo 2 caracteres</span>
            }

            <div class="register-field">
              <span class="register-field__icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <label class="sr-only" for="register-email">Correo electrónico</label>
              <input
                id="register-email"
                type="email"
                formControlName="email"
                placeholder="Correo Electronico"
                autocomplete="email"
              />
            </div>
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <span class="register-error">Correo inválido</span>
            }

            <div class="register-field">
              <span class="register-field__icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <label class="sr-only" for="register-password">Contraseña</label>
              <input
                id="register-password"
                type="password"
                formControlName="password"
                placeholder="Contraseña"
                autocomplete="new-password"
              />
            </div>
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="register-error">Mínimo 6 caracteres</span>
            }

            <div class="register-field">
              <span class="register-field__icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <label class="sr-only" for="register-confirm">Confirmar contraseña</label>
              <input
                id="register-confirm"
                type="password"
                formControlName="confirmPassword"
                placeholder="Confirmar contraseña"
                autocomplete="new-password"
              />
            </div>
            @if (form.hasError('mismatch') && form.get('confirmPassword')?.touched) {
              <span class="register-error">Las contraseñas no coinciden</span>
            }

            @if (errorMessage) {
              <div class="register-alert" role="alert">{{ errorMessage }}</div>
            }

            <button type="submit" class="register-btn" [disabled]="loading">
              {{ loading ? 'Registrando...' : 'Registrarse' }}
            </button>
          </form>

          <p class="register-login-link">
            ¿Ya tienes una cuenta?
            <a routerLink="/login">Inicia sesión aquí</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: [RegisterComponent.passwordsMatch] },
    );
  }

  private static passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (confirm == null || confirm === '') return null;
    return pass === confirm ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.auth
      .register(
        this.form.value.email,
        this.form.value.password,
        this.form.value.fullName,
      )
      .subscribe({
        next: () => this.router.navigate(['/dashboard'], { replaceUrl: true }),
        error: (err: { error?: { message?: string } }) => {
          this.errorMessage = err.error?.message || 'Error al registrar';
          this.loading = false;
        },
        complete: () => (this.loading = false),
      });
  }
}
