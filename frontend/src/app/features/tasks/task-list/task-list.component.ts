import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskService, type Task, type TaskPriority } from '@features/tasks/data-access';
import { AuthService } from '@core/services/auth.service';
import { AppSidebarComponent } from '@shared/layout';
import { NotificationService } from '@core/services/notification.service';
import { AppSettingsService } from '@core/services/app-settings.service';

export type TaskDateFilter = 'hoy' | 'semana' | 'todas';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterLink, AppSidebarComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit {
  private readonly notif = inject(NotificationService);
  private readonly appSettings = inject(AppSettingsService);

  tasks: Task[] = [];
  loading = true;
  dateFilter: TaskDateFilter = 'todas';
  avatarUrl = '';
  userHandle = '@Usuario';

  constructor(
    private taskService: TaskService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    const u = this.auth.user();
    const email = u?.email ?? 'usuario@ejemplo.com';
    const local = email.includes('@') ? email.split('@')[0] : email;
    this.userHandle = `@${local}`;
    this.avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u?.id ?? email)}`;
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getTasks(undefined).subscribe({
      next: (t: Task[]) => {
        this.tasks = t;
        this.notif.setTasks(t);
      },
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  setFilter(f: TaskDateFilter): void {
    this.dateFilter = f;
  }

  get filteredTasks(): Task[] {
    const list = this.tasks;
    if (this.dateFilter === 'todas') return list;
    const today = new Date();
    if (this.dateFilter === 'hoy') {
      return list.filter((t) => this.sameDay(new Date(t.dueDate), today));
    }
    return list.filter((t) => this.isInCurrentWeek(new Date(t.dueDate), today));
  }

  private sameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private isInCurrentWeek(taskDate: Date, today: Date): boolean {
    const d = new Date(today);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    const td = new Date(taskDate);
    return td >= monday && td <= sunday;
  }

  /** Etiqueta legible de prioridad / importancia. */
  priorityLabel(p: TaskPriority): string {
    const labels: Record<TaskPriority, string> = {
      baja: 'Baja',
      media: 'Media',
      alta: 'Alta',
      urgente: 'Urgente',
    };
    return labels[p] ?? p;
  }

  /** Re-evalúa cuando cambian preferencias de fecha/hora */
  datedTask(task: Task): string {
    this.appSettings.settings();
    return this.appSettings.formatDateTime(task.dueDate);
  }

  deleteTask(task: Task, ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
    if (confirm('¿Eliminar esta tarea?')) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => this.loadTasks(),
      });
    }
  }
}
