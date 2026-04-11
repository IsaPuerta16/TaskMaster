import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TaskService, type TaskStats } from '@features/tasks/data-access';
import { AppSidebarComponent } from '@shared/layout';
import { ProfileService } from './data-access/profile.service';
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
    private profileService: ProfileService,
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
        this.completed = s.completed;
        this.completionRate = Math.round(s.completionRate);
        this.streakDays = s.streakDays ?? 0;
      },
      error: () => {
        this.completed = 0;
        this.completionRate = 0;
        this.streakDays = 0;
      },
    });
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
