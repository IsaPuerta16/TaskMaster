import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import type {
  Task,
  TaskStatus,
  TaskPriority,
  CreateTaskDto,
  TaskStats,
} from '@core/models';

export type { TaskStatus, TaskPriority, Task, CreateTaskDto, TaskStats };

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private http: HttpClient) {}

  getTasks(status?: TaskStatus): Observable<Task[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Task[]>(`${environment.apiUrl}/tasks`, { params });
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${environment.apiUrl}/tasks/${id}`);
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${environment.apiUrl}/tasks`, dto);
  }

  updateTask(id: string, dto: Partial<CreateTaskDto> & { status?: TaskStatus }): Observable<Task> {
    return this.http.put<Task>(`${environment.apiUrl}/tasks/${id}`, dto);
  }

  deleteTask(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/tasks/${id}`);
  }

  getStats(): Observable<TaskStats> {
    return this.http.get<TaskStats>(`${environment.apiUrl}/tasks/stats`);
  }
}
