import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-page__main">
        <div class="login-card">
          <h1 class="login-card__brand">Nueva contraseña</h1>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form" novalidate>
            <div class="login-field">
              <input type="password" formControlName="password" placeholder="Nueva contraseña" autocomplete="new-password" />
            </div>
            <div class="login-field">
              <input type="password" formControlName="confirm" placeholder="Confirmar contraseña" autocomplete="new-password" />
            </div>
            @if (message) {
              <div class="login-alert" role="status">{{ message }}</div>
            }
            @if (errorMessage) {
              <div class="login-alert" role="alert">{{ errorMessage }}</div>
            }
            <button type="submit" class="login-btn" [disabled]="loading || form.invalid || !token">
              {{ loading ? 'Guardando…' : 'Guardar contraseña' }}
            </button>
          </form>
          <p class="login-register"><a routerLink="/login">Ir a iniciar sesión</a></p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../login/login.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', Validators.required],
  });
  token = '';
  loading = false;
  message = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.errorMessage = 'Enlace inválido. Solicita uno nuevo.';
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token) return;
    const { password, confirm } = this.form.getRawValue();
    if (password !== confirm) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.auth.resetPassword(this.token, password!).subscribe({
      next: (res) => {
        this.message = res.message;
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message ?? 'No se pudo restablecer la contraseña.';
        this.loading = false;
      },
    });
  }
}
