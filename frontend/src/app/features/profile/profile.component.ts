import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { AppSettingsService } from '@core/services/app-settings.service';
import { TaskService, type TaskStats } from '@features/tasks/data-access';
import { AppSidebarComponent } from '@shared/layout';
import { ProfileService } from './data-access/profile.service';
import { ToastService } from '@core/services/toast.service';
import type { User } from '@core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AppSidebarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  form: FormGroup;
  avatarUrl = '';
  userHandle = '@Usuario';
  stats: TaskStats | null = null;

  readonly roleOptions = [
    { value: 'estudiante', label: 'Estudiante' },
    { value: 'profesional', label: 'Profesional' },
    { value: 'otro', label: 'Otro' },
  ];

  constructor(
    public auth: AuthService,
    private taskService: TaskService,
    private fb: FormBuilder,
    private profileService: ProfileService,
    private toast: ToastService,
    private appSettings: AppSettingsService,
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(1)]],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      role: ['estudiante'],
    });
  }

  ngOnInit(): void {
    this.syncUserUi(this.auth.user());
    this.profileService.getMe().subscribe({
      next: (user) => {
        this.auth.setUser(user);
        this.syncUserUi(user);
        this.form.patchValue({
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          email: user.email,
          role: user.role ?? 'estudiante',
        });
      },
    });

    this.taskService.getStats().subscribe({
      next: (s: TaskStats) => {
        this.stats = s;
      },
      error: () => {
        this.stats = null;
      },
    });
  }

  i18nLabel(es: string, en: string): string {
    this.appSettings.settings();
    return this.appSettings.isEnglish() ? en : es;
  }

  completionPct(): number {
    const r = this.stats?.completionRate ?? 0;
    return Math.min(100, Math.max(0, Math.round(r)));
  }

  saveProfile(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.profileService.updateMe(this.form.getRawValue()).subscribe({
      next: (user) => {
        this.auth.setUser(user);
        this.syncUserUi(user);
        this.toast.profileSaved();
      },
      error: (err: unknown) => {
        const msg =
          err && typeof err === 'object' && 'error' in err
            ? (() => {
                const e = (err as { error?: { message?: string | string[] } }).error?.message;
                if (Array.isArray(e)) return e.join('. ');
                if (typeof e === 'string') return e;
                return null;
              })()
            : null;
        this.toast.profileSaveFailed(msg);
      },
    });
  }

  private syncUserUi(user: User | null): void {
    const email = user?.email ?? 'usuario@ejemplo.com';
    const local = email.includes('@') ? email.split('@')[0] : email;
    this.userHandle = `@${local}`;
    this.avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.id ?? email)}`;
  }
}
