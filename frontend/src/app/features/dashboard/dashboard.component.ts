import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { buildColombiaHolidayMap, toDateKey } from '@core/calendar/colombia-holidays';
import { AppSidebarComponent } from '@shared/layout';
import { ToastService } from '@core/services/toast.service';
import { ConfirmDialogService } from '@shared/dialogs/confirm-dialog.service';
import { TaskService, type Task } from '@features/tasks/data-access';
import {
  CalendarNotesService,
  type DayNote,
} from './data-access/calendar-notes.service';
import { RoutineService } from '@core/services/routine.service';

export interface CalendarDayCell {
  day: number;
  inMonth: boolean;
  dateKey: string;
  isHoliday: boolean;
  holidayName?: string;
  /** Una línea por nota y por tarea con vencimiento ese día (orden: notas, luego tareas). */
  previewLines: string[];
  isToday: boolean;
}

export interface CalendarWeekRow {
  weekLabel: number;
  days: CalendarDayCell[];
}

function getISOWeek(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AppSidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  host: {
    style:
      'display:block;width:100%;max-width:100%;min-width:0;box-sizing:border-box',
  },
})
export class DashboardComponent implements OnInit {
  private readonly calendarNotesService = inject(CalendarNotesService);
  private readonly routineService = inject(RoutineService);
  private readonly taskService = inject(TaskService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  year = new Date().getFullYear();
  month = new Date().getMonth();
  calendarWeeks: CalendarWeekRow[] = [];

  /** Notas por YYYY-MM-DD */
  notesMap: Record<string, DayNote[]> = {};

  /** Tareas del usuario (para preview en celdas por fecha de vencimiento). */
  private calendarTasks: Task[] = [];

  modalOpen = false;
  selectedKey: string | null = null;
  selectedDateLabel = '';
  selectedHolidayName: string | null = null;
  draftText = '';
  /** Si no es null, `Guardar` actualiza esa nota en lugar de crear una nueva. */
  editingNoteId: string | null = null;

  // Rutina modal
  routineModalOpen = false;
  routineText = '';
  routineLoading = false;

  readonly quickEmojis = ['😀', '🎉', '✅', '📌', '❤️', '⭐', '🔥', '💼', '✏️', '🗓️', '☕', '🎯'];

  /** Rango de años en los desplegables (centrado en el año actual). */
  readonly yearOptions = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - 12 + i);

  readonly monthOptions = Array.from({ length: 12 }, (_, i) => {
    const raw = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date(2000, i, 1));
    const label = raw.charAt(0).toUpperCase() + raw.slice(1);
    return { value: i, label };
  });

  private holidayMaps = new Map<number, Map<string, string>>();

  /** Filtros año/mes visibles al pulsar la fecha del título */
  readonly dateFilterOpen = signal(false);

  ngOnInit() {
    this.rebuildCalendar();
    this.loadVisibleNotes();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalOpen) {
      this.closeModal();
      return;
    }
    if (this.dateFilterOpen()) {
      this.closeDateFilter();
    }
  }

  toggleDateFilter(): void {
    this.dateFilterOpen.update((v) => !v);
  }

  closeDateFilter(): void {
    this.dateFilterOpen.set(false);
  }

  get monthTitle(): string {
    const raw = new Intl.DateTimeFormat('es-ES', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(this.year, this.month, 1));
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  notesForSelected(): DayNote[] {
    if (!this.selectedKey) return [];
    return this.notesMap[this.selectedKey] ?? [];
  }

  prevMonth(): void {
    if (this.month === 0) {
      this.month = 11;
      this.year--;
    } else {
      this.month--;
    }
    this.rebuildCalendar();
    this.loadVisibleNotes();
  }

  nextMonth(): void {
    if (this.month === 11) {
      this.month = 0;
      this.year++;
    } else {
      this.month++;
    }
    this.rebuildCalendar();
    this.loadVisibleNotes();
  }

  setYear(y: number): void {
    this.year = y;
    this.rebuildCalendar();
    this.loadVisibleNotes();
  }

  setMonth(m: number): void {
    this.month = m;
    this.rebuildCalendar();
    this.loadVisibleNotes();
  }

  goToday(): void {
    const t = new Date();
    this.year = t.getFullYear();
    this.month = t.getMonth();
    this.rebuildCalendar();
    this.loadVisibleNotes();
    this.closeDateFilter();
  }

  openDay(cell: CalendarDayCell): void {
    this.selectedKey = cell.dateKey;
    this.selectedHolidayName = cell.holidayName ?? null;
    this.draftText = '';
    this.editingNoteId = null;
    const [y, m, d] = cell.dateKey.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    let label = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
    label = label.charAt(0).toUpperCase() + label.slice(1);
    this.selectedDateLabel = label;
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.selectedKey = null;
    this.draftText = '';
    this.editingNoteId = null;
    this.selectedHolidayName = null;
  }

  get dayNoteFieldLabel(): string {
    return this.confirmDialog.pick(
      'Añadir o editar texto o emojis',
      'Add or edit text or emojis',
    );
  }

  get saveDayNoteButtonLabel(): string {
    if (this.editingNoteId) {
      return this.confirmDialog.pick('Guardar cambios', 'Save changes');
    }
    return this.confirmDialog.pick('Guardar en esta fecha', 'Save on this date');
  }

  get cancelEditLabel(): string {
    return this.confirmDialog.pick('Cancelar edición', 'Cancel editing');
  }

  get editNoteButtonLabel(): string {
    return this.confirmDialog.pick('Editar', 'Edit');
  }

  get dayNotePlaceholder(): string {
    return this.confirmDialog.pick(
      'Escribe aquí… (también puedes pegar emojis desde el teclado)',
      'Write here… (you can paste emojis from the keyboard too)',
    );
  }

  startEditNote(note: DayNote): void {
    this.editingNoteId = note.id;
    this.draftText = note.text;
  }

  cancelEditNote(): void {
    this.editingNoteId = null;
    this.draftText = '';
  }

  insertEmoji(emoji: string): void {
    this.draftText = (this.draftText ?? '') + emoji;
  }

  saveDayNote(): void {
    const text = this.draftText.trim();
    if (!text || !this.selectedKey) return;
    if (!this.notesMap[this.selectedKey]) this.notesMap[this.selectedKey] = [];

    const list = this.notesMap[this.selectedKey];
    if (this.editingNoteId) {
      const editingId = this.editingNoteId;
      this.editingNoteId = null;
      const idx = list.findIndex((n) => n.id === editingId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], text };
      } else {
        list.push({ id: crypto.randomUUID(), text });
      }
    } else {
      list.push({ id: crypto.randomUUID(), text });
    }
    this.draftText = '';
    this.rebuildCalendar();
    this.persistSelectedNotes(() => this.closeModal());
  }

  removeNote(id: string): void {
    if (!this.selectedKey) return;
    const list = this.notesMap[this.selectedKey] ?? [];
    const note = list.find((n) => n.id === id);
    const raw = (note?.text ?? '').trim().replace(/\s+/g, ' ');
    const snippet = raw.slice(0, 80);
    const truncated = raw.length > 80;
    const title = this.confirmDialog.pick('Eliminar nota', 'Delete note');
    const message = snippet
      ? this.confirmDialog.pick(
          `¿Seguro que quieres eliminar esta nota del calendario? «${snippet}${truncated ? '…' : ''}»`,
          `Are you sure you want to remove this calendar note? “${snippet}${truncated ? '…' : ''}”`,
        )
      : this.confirmDialog.pick(
          '¿Seguro que quieres eliminar esta nota del calendario?',
          'Are you sure you want to remove this calendar note?',
        );
    const confirmLabel = this.confirmDialog.pick('Eliminar', 'Delete');
    void this.confirmDialog
      .ask({ title, message, confirmLabel, danger: true })
      .then((ok) => {
        if (!ok) return;
        this.applyRemoveNote(id);
      });
  }

  private applyRemoveNote(id: string): void {
    if (!this.selectedKey) return;
    if (this.editingNoteId === id) {
      this.editingNoteId = null;
      this.draftText = '';
    }
    const list = this.notesMap[this.selectedKey] ?? [];
    this.notesMap[this.selectedKey] = list.filter((n) => n.id !== id);
    if (this.notesMap[this.selectedKey].length === 0) {
      delete this.notesMap[this.selectedKey];
    }
    this.rebuildCalendar();
    this.persistSelectedNotes();
  }

  generateRoutine(): void {
    this.routineLoading = true;
    this.routineService.generateRoutine().subscribe({
      next: (response) => {
        this.routineText = response.text;
        this.routineModalOpen = true;
        this.routineLoading = false;
      },
      error: () => {
        this.routineText = 'Error al generar la rutina. Intenta más tarde.';
        this.routineModalOpen = true;
        this.routineLoading = false;
      },
    });
  }

  closeRoutineModal(): void {
    this.routineModalOpen = false;
    this.routineText = '';
  }

  private getHolidayMap(y: number): Map<string, string> {
    let m = this.holidayMaps.get(y);
    if (!m) {
      m = buildColombiaHolidayMap(y);
      this.holidayMaps.set(y, m);
    }
    return m;
  }

  private rebuildCalendar(): void {
    this.calendarWeeks = this.buildCalendar(this.year, this.month);
  }

  private loadVisibleNotes(): void {
    const from = this.calendarWeeks[0]?.days[0]?.dateKey;
    const lastWeek = this.calendarWeeks[this.calendarWeeks.length - 1];
    const to = lastWeek?.days[lastWeek.days.length - 1]?.dateKey;
    if (!from || !to) return;
    this.calendarNotesService.getRange(from, to).subscribe({
      next: (rows) => {
        this.notesMap = Object.fromEntries(
          rows.map((row) => [row.dateKey, row.notes]),
        );
        this.loadCalendarTasks();
      },
      error: () => {
        this.notesMap = {};
        this.loadCalendarTasks();
      },
    });
  }

  private loadCalendarTasks(): void {
    this.taskService.getTasks(undefined).subscribe({
      next: (tasks) => {
        this.calendarTasks = tasks;
        this.rebuildCalendar();
      },
      error: () => {
        this.calendarTasks = [];
        this.rebuildCalendar();
      },
    });
  }

  private persistSelectedNotes(onSuccess?: () => void): void {
    if (!this.selectedKey) return;
    const notes = this.notesMap[this.selectedKey] ?? [];
    this.calendarNotesService.saveDate(this.selectedKey, notes).subscribe({
      next: () => {
        this.toastService.calendarDayNotesSaved();
        onSuccess?.();
      },
      error: (err: HttpErrorResponse) => {
        this.toastService.calendarDayNotesHttpError(err);
      },
    });
  }

  private truncatePreviewLine(text: string, maxLen = 52): string {
    const t = text.trim();
    if (!t) return '';
    return t.length > maxLen ? `${t.slice(0, maxLen - 1)}…` : t;
  }

  /** Clave YYYY-MM-DD local a partir del vencimiento de la tarea (alineado con las celdas del calendario). */
  private taskDueToDateKey(iso: string): string {
    const d = new Date(iso);
    return toDateKey(d.getFullYear(), d.getMonth(), d.getDate());
  }

  /** Una línea por nota y por tarea (no en una sola fila). */
  private buildCellPreviewLines(dateKey: string, notes: DayNote[] | undefined): string[] {
    const lines: string[] = [];
    for (const n of notes ?? []) {
      const line = this.truncatePreviewLine(n.text);
      if (line) lines.push(line);
    }
    for (const t of this.calendarTasks) {
      if (
        this.taskDueToDateKey(t.dueDate) === dateKey &&
        t.status !== 'finalizada'
      ) {
        const line = this.truncatePreviewLine(t.title);
        if (line) lines.push(line);
      }
    }
    const maxLines = 6;
    if (lines.length > maxLines) {
      return [...lines.slice(0, maxLines - 1), '…'];
    }
    return lines;
  }

  private buildCalendar(year: number, month: number): CalendarWeekRow[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const monday = new Date(firstDay);
    const d1 = firstDay.getDay();
    monday.setDate(firstDay.getDate() + (d1 === 0 ? -6 : 1 - d1));

    const sundayEnd = new Date(lastDay);
    const d2 = lastDay.getDay();
    sundayEnd.setDate(lastDay.getDate() + (d2 === 0 ? 0 : 7 - d2));

    const weeks: CalendarWeekRow[] = [];
    const rowMonday = new Date(monday);

    const today = new Date();

    while (rowMonday <= sundayEnd) {
      const days: CalendarDayCell[] = [];
      for (let i = 0; i < 7; i++) {
        const cellDate = new Date(rowMonday);
        cellDate.setDate(rowMonday.getDate() + i);
        const cy = cellDate.getFullYear();
        const cm = cellDate.getMonth();
        const cd = cellDate.getDate();
        const key = toDateKey(cy, cm, cd);
        const holMap = this.getHolidayMap(cy);
        const hol = holMap.get(key);
        const notes = this.notesMap[key] ?? [];
        const isToday =
          cy === today.getFullYear() &&
          cm === today.getMonth() &&
          cd === today.getDate();
        days.push({
          day: cd,
          inMonth: cm === month && cy === year,
          dateKey: key,
          isHoliday: !!hol,
          holidayName: hol,
          previewLines: this.buildCellPreviewLines(key, notes),
          isToday,
        });
      }
      weeks.push({
        weekLabel: getISOWeek(new Date(rowMonday)),
        days,
      });
      rowMonday.setDate(rowMonday.getDate() + 7);
    }

    return weeks;
  }
}
