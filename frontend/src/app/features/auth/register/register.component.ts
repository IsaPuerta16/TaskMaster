import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>TaskMaster</h1>
        <p class="subtitle">Crea tu cuenta</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="fullName">Nombre completo</label>
            <input id="fullName" type="text" formControlName="fullName" placeholder="Tu nombre" />
            @if (form.get('fullName')?.invalid && form.get('fullName')?.touched) {
              <span class="error">Mínimo 2 caracteres</span>
            }
          </div>

          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input id="email" type="email" formControlName="email" placeholder="tu@correo.com" />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <span class="error">Correo inválido</span>
            }
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input id="password" type="password" formControlName="password" placeholder="••••••••" />
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="error">Mínimo 6 caracteres</span>
            }
          </div>

          @if (errorMessage) {
            <div class="alert alert-error">{{ errorMessage }}</div>
          }

          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'Registrando...' : 'Registrarse' }}
          </button>
        </form>

        <p class="auth-link">
          ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a> · <a routerLink="/">Volver</a>
        </p>
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
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
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
