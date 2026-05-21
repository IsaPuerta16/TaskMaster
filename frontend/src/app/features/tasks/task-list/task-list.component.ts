import { Component, HostListener, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { isTaskOverdue, countOverdueTasks } from '@core/utils/is-task-overdue.util';
import { ConfirmDialogService } from '@shared/confirm-dialog/confirm-dialog.service';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { TaskService, type Task, type TaskPriority, type TaskStatus } from '@features/tasks/data-access';
import { AuthService } from '@core/services/auth.service';
import { UserAvatarService } from '@core/services/user-avatar.service';
import { AppSidebarComponent } from '@shared/layout';
import { NotificationService } from '@core/services/notification.service';
import { AppSettingsService } from '@core/services/app-settings.service';

export type TaskDateFilter = 'hoy' | 'semana' | 'todas' | 'vencidas' | 'archivadas';
export type TaskViewMode = 'lista' | 'tablero';

interface KanbanColumn {
  status: TaskStatus;
  title: string;
  tasks: Task[];
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterLink, AppSidebarComponent, DragDropModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit {
  private readonly notif = inject(NotificationService);
  readonly appSettings = inject(AppSettingsService);

  readonly L = computed(() => this.appSettings.ui().tasks);

  tasks: Task[] = [];
  private allActiveTasks: Task[] = [];
  loading = true;
  dateFilter: TaskDateFilter = 'todas';
  viewMode: TaskViewMode = 'lista';
  avatarUrl = '';
  userHandle = '@Usuario';

  kanbanPending: Task[] = [];
  kanbanInProgress: Task[] = [];
  kanbanDone: Task[] = [];

  private readonly statusSaving = new Set<string>();

  private readonly userAvatar = inject(UserAvatarService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmDialogService);

  constructor(
    private taskService: TaskService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    const u = this.auth.user();
    const email = u?.email ?? 'usuario@ejemplo.com';
    const local = email.includes('@') ? email.split('@')[0] : email;
    this.userHandle = `@${local}`;
    this.avatarUrl = this.userAvatar.urlFor(u);
    const filter = this.route.snapshot.queryParamMap.get('filter');
    if (filter === 'vencidas') this.dateFilter = 'vencidas';
    this.loadTasks();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(ev: KeyboardEvent): void {
    if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement) {
      return;
    }
    if (ev.key === 'n' || ev.key === 'N') {
      this.router.navigate(['/tasks/new']);
    }
  }

  loadTasks(): void {
    this.loading = true;
    const archived = this.dateFilter === 'archivadas';
    this.taskService.getTasks(undefined, archived).subscribe({
      next: (t: Task[]) => {
        this.tasks = t;
        if (!archived) {
          this.allActiveTasks = t;
          this.notif.setTasks(t);
        }
        this.syncKanbanLists();
      },
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  setFilter(f: TaskDateFilter): void {
    this.dateFilter = f;
    this.loadTasks();
  }

  setViewMode(mode: TaskViewMode): void {
    this.viewMode = mode;
  }

  get overdueCount(): number {
    return countOverdueTasks(this.allActiveTasks);
  }

  get filteredTasks(): Task[] {
    const list = this.tasks;
    if (this.dateFilter === 'todas' || this.dateFilter === 'archivadas') return list;
    if (this.dateFilter === 'vencidas') {
      return list
        .filter((t) => isTaskOverdue(t))
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }
    const today = new Date();
    if (this.dateFilter === 'hoy') {
      return list.filter((t) => this.sameDay(new Date(t.dueDate), today));
    }
    return list.filter((t) => this.isInCurrentWeek(new Date(t.dueDate), today));
  }

  isOverdue(task: Task): boolean {
    return isTaskOverdue(task);
  }

  emptyMessage(): string {
    if (this.dateFilter === 'vencidas') return this.L().emptyOverdue;
    if (this.dateFilter === 'archivadas') return this.L().emptyArchived;
    return this.L().empty;
  }

  snooze(task: Task, preset: 'tomorrow' | 'next_week' | { days: number }, ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
    const body =
      preset === 'tomorrow' || preset === 'next_week'
        ? { preset }
        : { days: preset.days };
    this.taskService.snoozeTask(task.id, body).subscribe({
      next: (updated) => {
        const idx = this.tasks.findIndex((t) => t.id === task.id);
        if (idx >= 0) this.tasks[idx] = updated;
        this.notif.setTasks(this.tasks);
        this.syncKanbanLists();
      },
    });
  }

  archiveTask(task: Task, ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.taskService.archiveTask(task.id).subscribe({
      next: () => this.loadTasks(),
    });
  }

  showSnoozeActions(task: Task): boolean {
    return !this.isDone(task) && this.dateFilter !== 'archivadas';
  }

  get kanbanColumns(): KanbanColumn[] {
    return [
      { status: 'pendiente', title: this.L().colPending, tasks: this.kanbanPending },
      { status: 'en_proceso', title: this.L().colProgress, tasks: this.kanbanInProgress },
      { status: 'finalizada', title: this.L().colDone, tasks: this.kanbanDone },
    ];
  }

  kanbanDropIds(): string[] {
    return ['kanban-pendiente', 'kanban-en_proceso', 'kanban-finalizada'];
  }

  private syncKanbanLists(): void {
    const filtered = this.filteredTasks;
    this.kanbanPending = filtered.filter((t) => t.status === 'pendiente');
    this.kanbanInProgress = filtered.filter((t) => t.status === 'en_proceso');
    this.kanbanDone = filtered.filter((t) => t.status === 'finalizada');
  }

  kanbanDrop(event: CdkDragDrop<Task[]>, targetStatus: TaskStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const task = event.previousContainer.data[event.previousIndex];
    if (!task || task.status === targetStatus) return;

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );

    const prevStatus = task.status;
    task.status = targetStatus;
    this.patchTaskStatus(task, targetStatus, prevStatus);
  }

  private patchTaskStatus(task: Task, status: TaskStatus, rollbackStatus: TaskStatus): void {
    this.statusSaving.add(task.id);
    this.taskService.updateTask(task.id, { status }).subscribe({
      next: (updated) => {
        const idx = this.tasks.findIndex((t) => t.id === task.id);
        if (idx >= 0) this.tasks[idx] = updated;
        this.notif.setTasks(this.tasks);
        this.statusSaving.delete(task.id);
      },
      error: () => {
        task.status = rollbackStatus;
        this.syncKanbanLists();
        this.statusSaving.delete(task.id);
      },
    });
  }

  isSavingStatus(taskId: string): boolean {
    return this.statusSaving.has(taskId);
  }

  toggleDone(task: Task, ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
    if (this.isSavingStatus(task.id)) return;

    const next: TaskStatus = task.status === 'finalizada' ? 'pendiente' : 'finalizada';
    const prev = task.status;
    task.status = next;
    this.syncKanbanLists();
    this.patchTaskStatus(task, next, prev);
  }

  isDone(task: Task): boolean {
    return task.status === 'finalizada';
  }

  priorityLabel(p: TaskPriority): string {
    const en = this.appSettings.isEnglish();
    const labels: Record<TaskPriority, { es: string; en: string }> = {
      baja: { es: 'Baja', en: 'Low' },
      media: { es: 'Media', en: 'Medium' },
      alta: { es: 'Alta', en: 'High' },
      urgente: { es: 'Urgente', en: 'Urgent' },
    };
    return en ? labels[p]?.en ?? p : labels[p]?.es ?? p;
  }

  
  categoryEmoji(task: Task): string {
    if (task.status === 'finalizada') return '✅';
    const map: Record<TaskPriority, string> = {
      baja: '📋',
      media: '📐',
      alta: '📌',
      urgente: '⚡',
    };
    return map[task.priority] ?? '📋';
  }

  priorityDotClass(p: TaskPriority): string {
    const map: Record<TaskPriority, string> = {
      baja: 'tasks-kanban-dot--baja',
      media: 'tasks-kanban-dot--media',
      alta: 'tasks-kanban-dot--alta',
      urgente: 'tasks-kanban-dot--urgente',
    };
    return map[p] ?? 'tasks-kanban-dot--baja';
  }

  datedTask(task: Task): string {
    this.appSettings.settings();
    return this.appSettings.formatDateTime(task.dueDate);
  }

  async deleteTask(task: Task, ev: Event): Promise<void> {
    ev.preventDefault();
    ev.stopPropagation();
    const ok = await this.confirm.confirm(this.L().deleteConfirm, {
      title: this.L().delete,
      confirmLabel: this.L().delete,
      danger: true,
    });
    if (!ok) return;
    this.taskService.deleteTask(task.id).subscribe({
      next: () => this.loadTasks(),
    });
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
}
