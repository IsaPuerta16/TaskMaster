import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-page__main">
        <div class="login-card">
          <h1 class="login-card__brand">Recuperar contraseña</h1>
          <p class="login-register" style="margin-bottom: 1rem">
            Te enviaremos un enlace si el correo está registrado.
          </p>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form" novalidate>
            <div class="login-field">
              <input type="email" formControlName="email" placeholder="Correo electrónico" autocomplete="email" />
            </div>
            @if (message) {
              <div class="login-alert" role="status">{{ message }}</div>
            }
            @if (errorMessage) {
              <div class="login-alert" role="alert">{{ errorMessage }}</div>
            }
            <button type="submit" class="login-btn" [disabled]="loading || form.invalid">
              {{ loading ? 'Enviando…' : 'Enviar enlace' }}
            </button>
          </form>
          <p class="login-register"><a routerLink="/login">Volver al inicio de sesión</a></p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../login/login.component.scss'],
})
export class ForgotPasswordComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
  loading = false;
  message = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
  ) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.message = '';
    this.auth.forgotPassword(this.form.value.email!).subscribe({
      next: (res) => {
        this.message = res.message;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo procesar la solicitud.';
        this.loading = false;
      },
    });
  }
}
