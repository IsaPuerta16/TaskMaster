import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskService, Task, TaskStatus } from '@core/services/task.service';
import { HeaderComponent } from '@shared/layout';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  template: `
    <div class="task-list-page">
      <app-header />

      <div class="task-list-page__toolbar">
        <a routerLink="/dashboard" class="back">← Dashboard</a>
        <h1>Mis tareas</h1>
        <a routerLink="/tasks/new" class="btn btn-primary">+ Nueva tarea</a>
      </div>

      <div class="filters">
        <button
          [class.active]="filter === null"
          (click)="filter = null; loadTasks()"
        >
          Todas
        </button>
        <button
          [class.active]="filter === 'pendiente'"
          (click)="filter = 'pendiente'; loadTasks()"
        >
          Pendientes
        </button>
        <button
          [class.active]="filter === 'en_proceso'"
          (click)="filter = 'en_proceso'; loadTasks()"
        >
          En proceso
        </button>
        <button
          [class.active]="filter === 'finalizada'"
          (click)="filter = 'finalizada'; loadTasks()"
        >
          Finalizadas
        </button>
      </div>

      @if (loading) {
        <p class="loading">Cargando...</p>
      } @else if (tasks.length === 0) {
        <p class="empty">No hay tareas. <a routerLink="/tasks/new">Crear una</a></p>
      } @else {
        <ul class="task-list">
          @for (task of tasks; track task.id) {
            <li class="task-item" [class.overdue]="isOverdue(task)" [class.completed]="task.status === 'finalizada'">
              <div class="task-main">
                <input
                  type="checkbox"
                  [checked]="task.status === 'finalizada'"
                  (change)="toggleComplete(task)"
                />
                <div class="task-info">
                  <a [routerLink]="['/tasks', task.id, 'edit']" class="task-title">{{ task.title }}</a>
                  <span class="task-meta">
                    {{ formatDate(task.dueDate) }} · {{ task.priority }}
                  </span>
                </div>
                <div class="task-actions">
                  <a [routerLink]="['/tasks', task.id, 'edit']" class="btn-icon">✏️</a>
                  <button class="btn-icon" (click)="deleteTask(task)">🗑️</button>
                </div>
              </div>
              @if (task.description) {
                <p class="task-desc">{{ task.description }}</p>
              }
            </li>
          }
        </ul>
      }
    </div>
  `,
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  loading = true;
  filter: TaskStatus | null = null;

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    this.taskService.getTasks(this.filter ?? undefined).subscribe({
      next: (t: Task[]) => (this.tasks = t),
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  isOverdue(task: Task) {
    return task.status !== 'finalizada' && new Date(task.dueDate) < new Date();
  }

  toggleComplete(task: Task) {
    const newStatus = task.status === 'finalizada' ? 'pendiente' : 'finalizada';
    this.taskService.updateTask(task.id, { status: newStatus }).subscribe({
      next: () => this.loadTasks(),
    });
  }

  deleteTask(task: Task) {
    if (confirm('¿Eliminar esta tarea?')) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => this.loadTasks(),
      });
    }
  }
}
