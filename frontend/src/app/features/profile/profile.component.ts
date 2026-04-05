import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TaskService, TaskStats } from '@core/services/task.service';
import { AppSidebarComponent, HeaderComponent } from '@shared/layout';

const PROFILE_STORAGE_KEY = 'taskmaster_profile';

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
  completed = 0;
  streakDays = 0;
  completionRate = 0;

  readonly roleOptions = [
    { value: 'estudiante', label: 'Estudiante' },
    { value: 'profesional', label: 'Profesional' },
    { value: 'otro', label: 'Otro' },
  ];

  constructor(
    public auth: AuthService,
    private taskService: TaskService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(1)]],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      role: ['estudiante'],
    });
  }

  ngOnInit(): void {
    const u = this.auth.user();
    const email = u?.email ?? 'usuario@ejemplo.com';
    const local = email.includes('@') ? email.split('@')[0] : email;
    this.userHandle = `@${local}`;
    this.avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u?.id ?? email)}`;

    const full = (u?.fullName ?? 'Usuario').trim();
    const parts = full.split(/\s+/);
    const firstName = parts[0] ?? '';
    const lastName = parts.slice(1).join(' ') || '';

    this.form.patchValue({
      firstName,
      lastName,
      email: u?.email ?? '',
      role: 'estudiante',
    });

    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Record<string, string>;
        this.form.patchValue({
          firstName: p['firstName'] ?? firstName,
          lastName: p['lastName'] ?? lastName,
          email: p['email'] ?? email,
          role: p['role'] ?? 'estudiante',
        });
      }
    } catch {
      /* ignore */
    }

    this.taskService.getStats().subscribe({
      next: (s: TaskStats) => {
        this.completed = s.completed;
        this.completionRate = Math.round(s.completionRate);
      },
      error: () => {
        this.completed = 0;
        this.completionRate = 0;
      },
    });

    const streakRaw = localStorage.getItem('taskmaster_racha_dias');
    this.streakDays = streakRaw ? parseInt(streakRaw, 10) || 0 : 0;
  }

  saveProfile(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(this.form.getRawValue()));
  }
}
