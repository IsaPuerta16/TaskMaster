import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TaskService } from '@features/tasks/data-access';
import {
  NotificationService,
  type NotifFilter,
  type NotifPrefs,
} from '@core/services/notification.service';
import { AppSidebarComponent } from '@shared/layout';

@Component({
  selector: 'app-user-notificaciones',
  standalone: true,
  imports: [CommonModule, RouterLink, AppSidebarComponent],
  templateUrl: './user-notificaciones.component.html',
  styleUrl: './user-notificaciones.component.scss',
})
export class UserNotificacionesComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly taskService = inject(TaskService);
  readonly notif = inject(NotificationService);

  avatarUrl = '';
  userHandle = '@Usuario';

  readonly filter = signal<NotifFilter>('todas');

  readonly visibleItems = computed(() => {
    const ids = this.notif.readIds();
    const f = this.filter();
    return this.notif.itemsRespectingPrefs().filter((i) => {
      const read = ids.has(i.id);
      if (f === 'todas') return true;
      if (f === 'pendientes') return !read;
      return read;
    });
  });

  readonly unreadCount = computed(() => this.notif.unreadCount());

  ngOnInit(): void {
    const u = this.auth.user();
    const email = u?.email ?? 'usuario@ejemplo.com';
    const local = email.includes('@') ? email.split('@')[0] : email;
    this.userHandle = `@${local}`;
    this.avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u?.id ?? email)}`;

    this.taskService.getTasks().subscribe({
      next: (tasks) => this.notif.setTasks(tasks),
      error: () => this.notif.setTasks([]),
    });
  }

  setFilter(f: NotifFilter): void {
    this.filter.set(f);
  }

  markRead(id: string): void {
    this.notif.markRead(id);
  }

  markAllRead(): void {
    this.notif.markAllRead();
  }

  togglePref(key: keyof NotifPrefs): void {
    this.notif.togglePref(key);
  }
}
