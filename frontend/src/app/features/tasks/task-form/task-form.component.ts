import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService, TaskPriority, Task } from '@core/services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="task-form-page">
      <header class="header">
        <a routerLink="/tasks" class="back">← Volver</a>
        <h1>{{ isEdit ? 'Editar tarea' : 'Nueva tarea' }}</h1>
      </header>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">
        <div class="form-group">
          <label for="title">Título *</label>
          <input id="title" type="text" formControlName="title" placeholder="Nombre de la tarea" />
          @if (form.get('title')?.invalid && form.get('title')?.touched) {
            <span class="error">El título es obligatorio</span>
          }
        </div>

        <div class="form-group">
          <label for="description">Descripción</label>
          <textarea id="description" formControlName="description" rows="3" placeholder="Detalles opcionales"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="dueDate">Fecha límite *</label>
            <input id="dueDate" type="datetime-local" formControlName="dueDate" />
            @if (form.get('dueDate')?.invalid && form.get('dueDate')?.touched) {
              <span class="error">Fecha obligatoria</span>
            }
          </div>
          <div class="form-group">
            <label for="priority">Prioridad</label>
            <select id="priority" formControlName="priority">
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>

        @if (errorMessage) {
          <div class="alert alert-error">{{ errorMessage }}</div>
        }

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear tarea') }}
          </button>
          <a routerLink="/tasks" class="btn btn-secondary">Cancelar</a>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./task-form.component.scss'],
})
export class TaskFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  taskId: string | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
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

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    const value = this.form.value;
    const dto = {
      title: value.title,
      description: value.description || undefined,
      dueDate: new Date(value.dueDate).toISOString(),
      priority: value.priority,
    };

    if (this.isEdit && this.taskId) {
      this.taskService.updateTask(this.taskId, dto).subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: (err: { error?: { message?: string } }) => {
          this.errorMessage = err.error?.message || 'Error al guardar';
          this.loading = false;
        },
        complete: () => (this.loading = false),
      });
    } else {
      this.taskService.createTask(dto).subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: (err: { error?: { message?: string } }) => {
          this.errorMessage = err.error?.message || 'Error al crear';
          this.loading = false;
        },
        complete: () => (this.loading = false),
      });
    }
  }
}
