import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TaskService } from '@features/tasks/data-access';
import {
  NotificationService,
  NOTIF_REMINDER_DAY_STEPS,
  type NotifFilter,
  type NotifPrefs,
} from '@core/services/notification.service';
import { AppSettingsService } from '@core/services/app-settings.service';
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
  private readonly appSettings = inject(AppSettingsService);

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

  /** Texto de ayuda cuando la lista está vacía (ventana de vencimientos / preferencias). */
  emptyListHint(): string {
    this.appSettings.settings();
    const en = this.appSettings.isEnglish();
    const days = NOTIF_REMINDER_DAY_STEPS.join(', ');
    return en
      ? `Due-date reminders appear 5, 2, and 1 day before the due date (in your account time zone), plus under 3 hours and under 1 hour on the due day. Overdue tasks stay listed. Turn on “Due date reminders” below if off.`
      : `Los recordatorios de vencimiento aparecen a ${days} días antes (según tu zona horaria), y el día del vencimiento cuando queden menos de 3 horas y menos de 1 hora. Las vencidas siguen listadas. Activa «Recordatorios de vencimiento» abajo si está desactivado.`;
  }
}
