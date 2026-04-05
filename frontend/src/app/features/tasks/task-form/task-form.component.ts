import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService, TaskPriority, Task } from '@core/services/task.service';
import { AuthService } from '@core/services/auth.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
})
export class TaskFormComponent implements OnInit {
  readonly useLocalApi = environment.useLocalApi;

  form: FormGroup;
  isEdit = false;
  taskId: string | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: ['', Validators.required],
      priority: ['media' as TaskPriority],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.taskId = id;
      this.taskService.getTask(id).subscribe({
        next: (task: Task) => {
          const d = new Date(task.dueDate);
          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          this.form.patchValue({
            title: task.title,
            description: task.description || '',
            dueDate: local,
            priority: task.priority,
          });
        },
      });
    } else {
      const now = new Date();
      now.setHours(now.getHours() + 1, 0, 0, 0);
      this.form.patchValue({
        dueDate: now.toISOString().slice(0, 16),
      });
    }
  }

  get loginReturnUrl(): string {
    return this.router.url;
  }

  private parseApiError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'No hay conexión con el servidor. Comprueba que el backend esté en marcha (puerto 3000).';
    }
    if (err.status === 401) {
      return 'Debes iniciar sesión para guardar tareas.';
    }
    const e = err.error as { message?: string | string[] } | null;
    if (e && Array.isArray(e.message)) {
      return e.message.join('. ');
    }
    if (e && typeof e.message === 'string') {
      return e.message;
    }
    return 'No se pudo guardar la tarea.';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.useLocalApi && !this.auth.isAuthenticated()) {
      this.errorMessage =
        'Inicia sesión para crear o editar tareas. Usa el enlace de abajo si no estás registrado.';
      return;
    }
    const value = this.form.value;
    const parsed = new Date(value.dueDate);
    if (Number.isNaN(parsed.getTime())) {
      this.errorMessage = 'La fecha límite no es válida.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    const dto = {
      title: value.title,
      description: value.description || undefined,
      dueDate: parsed.toISOString(),
      priority: value.priority,
    };

    if (this.isEdit && this.taskId) {
      this.taskService.updateTask(this.taskId, dto).subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: (err: HttpErrorResponse) => {
          this.errorMessage = this.parseApiError(err);
          this.loading = false;
        },
        complete: () => (this.loading = false),
      });
    } else {
      this.taskService.createTask(dto).subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: (err: HttpErrorResponse) => {
          this.errorMessage = this.parseApiError(err);
          this.loading = false;
        },
        complete: () => (this.loading = false),
      });
    }
  }
}
