import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '@env/environment';
import type {
  Task,
  TaskStatus,
  TaskPriority,
  CreateTaskDto,
  TaskStats,
} from '@core/models';

export type { TaskStatus, TaskPriority, Task, CreateTaskDto, TaskStats };

const LOCAL_TASKS_KEY = 'taskmaster_local_tasks_v1';
const LOCAL_USER_ID = 'local-user';

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private http: HttpClient) {}

  getTasks(status?: TaskStatus): Observable<Task[]> {
    if (environment.useLocalApi) {
      let tasks = this.readLocalTasks();
      if (status) tasks = tasks.filter((t) => t.status === status);
      tasks.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      return of(tasks);
    }
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Task[]>(`${environment.apiUrl}/tasks`, { params });
  }

  getTask(id: string): Observable<Task> {
    if (environment.useLocalApi) {
      const task = this.readLocalTasks().find((t) => t.id === id);
      return task
        ? of(task)
        : throwError(
            () =>
              new HttpErrorResponse({
                status: 404,
                statusText: 'Not Found',
              }),
          );
    }
    return this.http.get<Task>(`${environment.apiUrl}/tasks/${id}`);
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    if (environment.useLocalApi) {
      const now = new Date().toISOString();
      const task: Task = {
        id: crypto.randomUUID(),
        title: dto.title,
        description: dto.description ?? null,
        dueDate: dto.dueDate,
        priority: dto.priority ?? 'media',
        status: 'pendiente',
        userId: LOCAL_USER_ID,
        createdAt: now,
        updatedAt: now,
      };
      const tasks = this.readLocalTasks();
      tasks.unshift(task);
      this.writeLocalTasks(tasks);
      return of(task);
    }
    return this.http.post<Task>(`${environment.apiUrl}/tasks`, dto);
  }

  updateTask(
    id: string,
    dto: Partial<CreateTaskDto> & { status?: TaskStatus },
  ): Observable<Task> {
    if (environment.useLocalApi) {
      const tasks = this.readLocalTasks();
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) {
        return throwError(
          () =>
            new HttpErrorResponse({
              status: 404,
              statusText: 'Not Found',
            }),
        );
      }
      const prev = tasks[idx];
      const updated: Task = {
        ...prev,
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && {
          description: dto.description ? dto.description : null,
        }),
        ...(dto.dueDate !== undefined && { dueDate: dto.dueDate }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.status !== undefined && { status: dto.status }),
        updatedAt: new Date().toISOString(),
      };
      tasks[idx] = updated;
      this.writeLocalTasks(tasks);
      return of(updated);
    }
    return this.http.put<Task>(`${environment.apiUrl}/tasks/${id}`, dto);
  }

  deleteTask(id: string): Observable<{ message: string }> {
    if (environment.useLocalApi) {
      const tasks = this.readLocalTasks();
      const next = tasks.filter((t) => t.id !== id);
      if (next.length === tasks.length) {
        return throwError(
          () =>
            new HttpErrorResponse({
              status: 404,
              statusText: 'Not Found',
            }),
        );
      }
      this.writeLocalTasks(next);
      return of({ message: 'Eliminada' });
    }
    return this.http.delete<{ message: string }>(
      `${environment.apiUrl}/tasks/${id}`,
    );
  }

  getStats(): Observable<TaskStats> {
    if (environment.useLocalApi) {
      const tasks = this.readLocalTasks();
      const total = tasks.length;
      const completed = tasks.filter((t) => t.status === 'finalizada').length;
      const pending = tasks.filter((t) => t.status === 'pendiente').length;
      const now = new Date();
      const overdue = tasks.filter(
        (t) => t.status !== 'finalizada' && new Date(t.dueDate) < now,
      ).length;
      const completionRate = total ? (completed / total) * 100 : 0;
      return of({
        total,
        completed,
        pending,
        overdue,
        completionRate,
      });
    }
    return this.http.get<TaskStats>(`${environment.apiUrl}/tasks/stats`);
  }

  private readLocalTasks(): Task[] {
    try {
      const raw = localStorage.getItem(LOCAL_TASKS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Task[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeLocalTasks(tasks: Task[]): void {
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(tasks));
  }
}
