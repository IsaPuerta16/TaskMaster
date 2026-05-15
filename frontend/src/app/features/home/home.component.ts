import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SidebarLayoutComponent } from '@shared/layout';

interface QuickNote {
  id: number;
  text: string;
  accent: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarLayoutComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  /** May 2026 — starts Friday (Mon=0 → 4 leading nulls) */
  readonly weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  readonly calendarDays: (number | null)[] = [
    null, null, null, null,            // Mon – Thu (padding)
    1,  2,  3,
    4,  5,  6,  7,  8,  9,  10,
    11, 12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31,
  ];

  readonly taskDays = new Set([5, 10, 14, 19, 22, 28]);

  readonly upcomingTasks = [
    { day: 5,  label: 'Entrega sprint 3',         priority: 'alta' },
    { day: 10, label: 'Revisión diseño UI',        priority: 'media' },
    { day: 14, label: 'Demo cliente',              priority: 'urgente' },
    { day: 19, label: 'Informe mensual',           priority: 'media' },
    { day: 22, label: 'Pruebas de integración',    priority: 'alta' },
    { day: 28, label: 'Cierre de iteración',       priority: 'baja' },
  ];

  notes: QuickNote[] = [
    { id: 1, text: 'Revisar entregables del sprint antes del viernes', accent: 'teal' },
    { id: 2, text: 'Reunión de equipo a las 3 pm — sala 2', accent: 'pink' },
    { id: 3, text: 'Actualizar documentación de la API v2', accent: 'purple' },
  ];

  newNote = '';

  addNote() {
    const trimmed = this.newNote.trim();
    if (!trimmed) return;
    this.notes.unshift({ id: Date.now(), text: trimmed, accent: 'teal' });
    this.newNote = '';
  }

  removeNote(id: number) {
    this.notes = this.notes.filter(n => n.id !== id);
  }
}
