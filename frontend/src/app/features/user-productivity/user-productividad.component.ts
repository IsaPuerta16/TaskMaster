import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskService } from '@features/tasks/data-access';
import { NotificationService } from '@core/services/notification.service';
import { AppSettingsService } from '@core/services/app-settings.service';
import { AppSidebarComponent } from '@shared/layout';
import type { Task, TaskPriority, TaskStats } from '@features/tasks/data-access';
import type { ProductividadRange } from '@core/productividad-settings';

const PRIORITY_LABEL_EN: Record<TaskPriority, string> = {
  urgente: 'Urgent',
  alta: 'High',
  media: 'Medium',
  baja: 'Low',
};

@Component({
  selector: 'app-user-productividad',
  standalone: true,
  imports: [CommonModule, RouterLink, AppSidebarComponent],
  templateUrl: './user-productividad.component.html',
  styleUrl: './user-productividad.component.scss',
})
export class UserProductividadComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly notif = inject(NotificationService);
  readonly appSettings = inject(AppSettingsService);

  readonly tasks = signal<Task[]>([]);
  readonly insights = signal<string[]>([]);
  readonly loading = signal(true);
  readonly range = this.appSettings.productividadRange;
  readonly prodPrefs = this.appSettings.productividadPrefs;

  readonly daysLabel = computed(() => {
    this.appSettings.settings();
    const r = this.range();
    return this.appSettings.isEnglish()
      ? r === '7'
        ? '7 days'
        : '30 days'
      : r === '7'
        ? '7 días'
        : '30 días';
  });

  readonly completedInRange = computed(() => {
    const list = this.tasks();
    const days = this.range() === '7' ? 7 : 30;
    const start = this.startOfRange(days);
    return list.filter(
      (t) =>
        t.status === 'finalizada' && new Date(t.updatedAt).getTime() >= start.getTime(),
    ).length;
  });

  readonly tasksInRangeList = computed(() => {
    const list = this.tasks();
    const days = this.range() === '7' ? 7 : 30;
    const start = this.startOfRange(days);
    return list.filter((t) => new Date(t.createdAt).getTime() >= start.getTime());
  });

  readonly compliancePct = computed(() => {
    const list = this.tasksInRangeList();
    if (list.length === 0) return 100;
    const done = list.filter((t) => t.status === 'finalizada').length;
    return Math.round((done / list.length) * 100);
  });

  readonly streakDays = computed(() => this.computeStreak(this.tasks()));

  /** Una barra por día (últimos 7 o 14 muestras según rango) */
  readonly activityBars = computed(() => {
    this.appSettings.settings();
    const days = this.range() === '7' ? 7 : 14;
    const list = this.tasks();
    const bars: { label: string; count: number }[] = [];
    const maxDay = new Date();
    maxDay.setHours(23, 59, 59, 999);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(maxDay);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = list.filter((t) => {
        if (t.status !== 'finalizada') return false;
        const u = new Date(t.updatedAt);
        return u >= d && u < next;
      }).length;
      const label =
        days <= 7
          ? this.appSettings.formatWeekdayShort(d)
          : this.appSettings.formatDayMonth(d);
      bars.push({ label, count });
    }
    const max = Math.max(1, ...bars.map((b) => b.count));
    return bars.map((b) => ({ ...b, heightPct: (b.count / max) * 100 }));
  });

  readonly prioritySlices = computed(() => {
    this.appSettings.settings();
    const list = this.tasksInRangeList();
    const order: TaskPriority[] = ['urgente', 'alta', 'media', 'baja'];
    const counts: Record<TaskPriority, number> = {
      urgente: 0,
      alta: 0,
      media: 0,
      baja: 0,
    };
    for (const t of list) {
      if (t.status === 'finalizada') continue;
      counts[t.priority]++;
    }
    const total = order.reduce((s, k) => s + counts[k], 0) || 1;
    const colors: Record<TaskPriority, string> = {
      urgente: '#ef4444',
      alta: '#f97316',
      media: '#3b82f6',
      baja: '#22c55e',
    };
    const en = this.appSettings.isEnglish();
    let acc = 0;
    return order.map((p) => {
      const pct = (counts[p] / total) * 100;
      const start = acc;
      acc += pct;
      return {
        key: p,
        label: en ? PRIORITY_LABEL_EN[p] : p.charAt(0).toUpperCase() + p.slice(1),
        pct,
        count: counts[p],
        color: colors[p],
        startDeg: (start / 100) * 360,
        endDeg: (acc / 100) * 360,
      };
    });
  });

  readonly noPendingPriorities = computed(() =>
    this.prioritySlices().every((s) => s.count === 0),
  );

  /** Total de tareas pendientes en el periodo (número central del donut). */
  readonly totalPendingInRange = computed(() => {
    const list = this.tasksInRangeList();
    return list.filter((t) => t.status !== 'finalizada').length;
  });

  readonly donutGradient = computed(() => {
    const slices = this.prioritySlices();
    let acc = 0;
    const parts: string[] = [];
    for (const s of slices) {
      if (s.pct <= 0) continue;
      const a = (acc / 100) * 360;
      acc += s.pct;
      const b = (acc / 100) * 360;
      parts.push(`${s.color} ${a}deg ${b}deg`);
    }
    if (parts.length === 0) {
      return 'conic-gradient(#475569 0deg 360deg)';
    }
    return `conic-gradient(${parts.join(', ')})`;
  });

  ngOnInit(): void {
    this.taskService.getTasks().subscribe({
      next: (t) => {
        this.tasks.set(t);
        this.notif.setTasks(t);
        this.loadInsights();
      },
      error: () => this.loading.set(false),
    });
  }

  setRange(r: ProductividadRange): void {
    this.appSettings.setProductividadRange(r);
  }

  private startOfRange(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private loadInsights(): void {
    this.taskService.getStats().subscribe({
      next: (stats: TaskStats) => {
        this.insights.set(
          stats.insights?.length
            ? stats.insights
            : ['Aún no hay suficiente actividad para generar insights.'],
        );
        this.loading.set(false);
      },
      error: () => {
        this.insights.set(['No se pudieron cargar los insights.']);
        this.loading.set(false);
      },
    });
  }

  private computeStreak(all: Task[]): number {
    const doneDays = new Set<string>();
    for (const t of all) {
      if (t.status !== 'finalizada') continue;
      const d = new Date(t.updatedAt);
      doneDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }
    let streak = 0;
    for (let i = 0; i < 400; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (doneDays.has(key)) streak++;
      else if (i > 0) break;
    }
    return streak;
  }
}
