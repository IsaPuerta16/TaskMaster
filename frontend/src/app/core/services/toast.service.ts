import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AppSettingsService } from './app-settings.service';

export type ToastKind = 'success' | 'info' | 'error';

export interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly appSettings = inject(AppSettingsService);
  readonly toasts = signal<Toast[]>([]);
  private seq = 0;

  /** Texto según idioma de la app (configuración del usuario). */
  pick(es: string, en: string): string {
    return this.appSettings.isEnglish() ? en : es;
  }

  show(message: string, kind: ToastKind = 'success', durationMs = 4200): void {
    const id = `toast-${++this.seq}`;
    this.toasts.update((list) => [...list, { id, kind, message }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: string): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  profileSaved(): void {
    this.show(
      this.pick('Cambios guardados correctamente.', 'Changes saved successfully.'),
      'success',
    );
  }

  profileSaveFailed(serverMessage: string | null | undefined): void {
    const fallback = this.pick(
      'No se pudieron guardar los cambios.',
      'Could not save your changes.',
    );
    const trimmed = serverMessage?.trim();
    this.show(trimmed || fallback, 'error');
  }

  taskCreated(): void {
    this.show(this.pick('Tarea creada con éxito.', 'Task created successfully.'), 'success');
  }

  taskUpdated(): void {
    this.show(this.pick('Tarea actualizada correctamente.', 'Task updated successfully.'), 'success');
  }

  taskDeleted(title: string): void {
    this.show(
      this.pick(`Se eliminó «${title}».`, `“${title}” has been removed.`),
      'success',
    );
  }

  /** Mensaje para el formulario y toasts al fallar crear/editar tarea. */
  taskSaveHttpError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return this.pick(
        'No hay conexión con el servidor. Comprueba que el backend esté en marcha.',
        'Could not reach the server. Make sure the backend is running.',
      );
    }
    if (err.status === 401) {
      return this.pick(
        'Debes iniciar sesión para guardar tareas.',
        'You must be signed in to save tasks.',
      );
    }
    const e = err.error as { message?: string | string[] } | null;
    if (e?.message) {
      if (Array.isArray(e.message)) return e.message.join('. ');
      if (typeof e.message === 'string') return e.message;
    }
    return this.pick('No se pudo guardar la tarea.', 'Could not save the task.');
  }

  /** Tras guardar notas del día en el calendario (modal del dashboard). */
  calendarDayNotesSaved(): void {
    this.show(
      this.pick('Cambios guardados en el calendario.', 'Calendar changes saved.'),
      'success',
      5000,
    );
  }

  calendarDayNotesHttpError(err: HttpErrorResponse): void {
    const fallback = this.pick(
      'No se pudieron guardar las notas del día.',
      'Could not save the notes for this day.',
    );
    if (err.status === 0) {
      this.show(
        this.pick(
          'No hay conexión con el servidor. Comprueba que el backend esté en marcha.',
          'Could not reach the server. Make sure the backend is running.',
        ),
        'error',
      );
      return;
    }
    if (err.status === 401) {
      this.show(
        this.pick('Debes iniciar sesión para guardar notas.', 'You must be signed in to save notes.'),
        'error',
      );
      return;
    }
    const e = err.error as { message?: string | string[] } | null;
    if (e?.message) {
      if (Array.isArray(e.message)) {
        this.show(e.message.join('. ') || fallback, 'error');
        return;
      }
      if (typeof e.message === 'string' && e.message.trim()) {
        this.show(e.message.trim(), 'error');
        return;
      }
    }
    this.show(fallback, 'error');
  }

  taskDeleteHttpError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return this.pick(
        'No hay conexión con el servidor. Comprueba que el backend esté en marcha.',
        'Could not reach the server. Make sure the backend is running.',
      );
    }
    const e = err.error as { message?: string | string[] } | null;
    if (e?.message) {
      if (Array.isArray(e.message)) return e.message.join('. ');
      if (typeof e.message === 'string') return e.message;
    }
    return this.pick('No se pudo eliminar la tarea.', 'Could not delete the task.');
  }
}
