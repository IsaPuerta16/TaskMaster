import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { TaskService, type Task, type TaskPriority, type TaskStatus } from '@features/tasks/data-access';
import { AuthService } from '@core/services/auth.service';
import { AppSidebarComponent } from '@shared/layout';
import { NotificationService } from '@core/services/notification.service';
import { AppSettingsService } from '@core/services/app-settings.service';
import { ToastService } from '@core/services/toast.service';
import { ConfirmDialogService } from '@shared/dialogs/confirm-dialog.service';

export type TaskDateFilter = 'hoy' | 'semana' | 'todas';

export type TaskViewMode = 'lista' | 'tablero';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterLink, AppSidebarComponent, DragDropModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit {
  private readonly notif = inject(NotificationService);
  private readonly appSettings = inject(AppSettingsService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmDialogService);

  tasks: Task[] = [];
  loading = true;
  dateFilter: TaskDateFilter = 'todas';
  viewMode: TaskViewMode = 'lista';
  /** Listas mutables para CDK (mismas referencias de `Task` que en `tasks`). */
  boardPending: Task[] = [];
  boardProgress: Task[] = [];
  boardDone: Task[] = [];
  avatarUrl = '';
  userHandle = '@Usuario';
  /** Evita doble envío mientras se guarda el estado «hecha». */
  updatingStatusId: string | null = null;

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
        this.refreshBoardColumns();
      },
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  setFilter(f: TaskDateFilter): void {
    this.dateFilter = f;
    this.refreshBoardColumns();
  }

  setViewMode(mode: TaskViewMode): void {
    this.viewMode = mode;
    if (mode === 'tablero') {
      this.refreshBoardColumns();
    }
  }

  i18nLabel(es: string, en: string): string {
    this.appSettings.settings();
    return this.appSettings.isEnglish() ? en : es;
  }

  viewModeLabel(mode: TaskViewMode): string {
    return mode === 'lista'
      ? this.i18nLabel('Lista', 'List')
      : this.i18nLabel('Tablero', 'Board');
  }

  tableroButtonTitle(): string {
    return this.i18nLabel(
      'Tablero Kanban: tres columnas (Pendiente, En proceso, Hecho). Arrastra tarjetas entre columnas para cambiar el estado.',
      'Kanban board: three columns (Pending, In progress, Done). Drag cards between columns to change status.',
    );
  }

  kanbanBoardHint(): string {
    return this.i18nLabel(
      'En cada columna puedes desplazarte con la rueda o el dedo: la vista se alinea al centrarse en cada tarea. Arrastra una tarjeta a otra columna para cambiar su estado.',
      'Scroll inside each column with wheel or finger; the view snaps so each task lines up as you stop. Drag a card to another column to change its status.',
    );
  }

  columnTitle(status: TaskStatus): string {
    switch (status) {
      case 'pendiente':
        return this.i18nLabel('Pendiente', 'Pending');
      case 'en_proceso':
        return this.i18nLabel('En proceso', 'In progress');
      case 'finalizada':
        return this.i18nLabel('Hecho', 'Done');
      default:
        return status;
    }
  }

  private refreshBoardColumns(): void {
    const list = this.filteredTasks;
    this.boardPending = list.filter((t) => t.status === 'pendiente');
    this.boardProgress = list.filter((t) => t.status === 'en_proceso');
    this.boardDone = list.filter((t) => t.status === 'finalizada');
  }

  onBoardDrop(event: CdkDragDrop<Task[]>): void {
    const task = event.item.data as Task;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }
    const targetStatus = event.container.id.replace('drop-', '') as TaskStatus;
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
    task.status = targetStatus;
    this.taskService.updateTask(task.id, { status: targetStatus }).subscribe({
      next: () => {
        this.toast.taskUpdated();
        this.notif.setTasks(this.tasks);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.show(this.toast.taskSaveHttpError(err), 'error');
        this.loadTasks();
      },
    });
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

  listDoneCheckboxLabel(task: Task): string {
    return task.status === 'finalizada'
      ? this.i18nLabel('Marcar como no hecha', 'Mark as not done')
      : this.i18nLabel('Marcar como hecha', 'Mark as done');
  }

  onListDoneToggle(task: Task, ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const wantDone = input.checked;
    const newStatus: TaskStatus = wantDone ? 'finalizada' : 'pendiente';
    if (task.status === newStatus) return;

    const prev = task.status;
    this.updatingStatusId = task.id;
    task.status = newStatus;
    this.refreshBoardColumns();

    this.taskService.updateTask(task.id, { status: newStatus }).subscribe({
      next: () => {
        this.updatingStatusId = null;
        this.toast.taskUpdated();
        this.notif.setTasks(this.tasks);
      },
      error: (err: HttpErrorResponse) => {
        this.updatingStatusId = null;
        task.status = prev;
        input.checked = prev === 'finalizada';
        this.refreshBoardColumns();
        this.toast.show(this.toast.taskSaveHttpError(err), 'error');
      },
    });
  }

  deleteTask(task: Task, ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
    const title = this.confirm.pick('Eliminar tarea', 'Delete task');
    const message = this.confirm.pick(
      `¿Seguro que quieres eliminar «${task.title}»? Esta acción no se puede deshacer.`,
      `Are you sure you want to delete “${task.title}”? This cannot be undone.`,
    );
    const confirmLabel = this.confirm.pick('Eliminar', 'Delete');
    void this.confirm
      .ask({ title, message, confirmLabel, danger: true })
      .then((ok) => {
        if (!ok) return;
        this.taskService.deleteTask(task.id).subscribe({
          next: () => {
            this.toast.taskDeleted(task.title);
            this.loadTasks();
          },
          error: (err: HttpErrorResponse) => {
            this.toast.show(this.toast.taskDeleteHttpError(err), 'error');
          },
        });
      });
  }
}
