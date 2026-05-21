import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ConfirmDialogService } from '@shared/confirm-dialog/confirm-dialog.service';
import { buildColombiaHolidayMap, toDateKey } from '@core/calendar/colombia-holidays';
import { TaskService } from '@core/services/task.service';
import type { Task, TaskPriority } from '@core/models';
import { countOverdueTasks, isTaskOverdue } from '@core/utils/is-task-overdue.util';
import { AppSidebarComponent } from '@shared/layout';
import {
  CalendarNotesService,
  type DayNote,
} from './data-access/calendar-notes.service';

export interface CalendarDayCell {
  day: number;
  inMonth: boolean;
  dateKey: string;
  isHoliday: boolean;
  holidayName?: string;
  
  preview: string;
  taskCount: number;
  taskPreview: string;
  tasks: Task[];
  isToday: boolean;
}

export interface CalendarWeekRow {
  weekLabel: number;
  days: CalendarDayCell[];
}

export type DayEntryType = 'event' | 'task';

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
  imports: [CommonModule, FormsModule, RouterLink, DragDropModule, AppSidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  host: {
    style:
      'display:block;width:100%;max-width:100%;min-width:0;box-sizing:border-box',
  },
})
export class DashboardComponent implements OnInit {
  private readonly calendarNotesService = inject(CalendarNotesService);
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmDialogService);
  year = new Date().getFullYear();
  month = new Date().getMonth();
  calendarWeeks: CalendarWeekRow[] = [];

  
  notesMap: Record<string, DayNote[]> = {};
  
  tasksMap: Record<string, Task[]> = {};
  overdueCount = 0;

  modalOpen = false;
  selectedKey: string | null = null;
  selectedDateLabel = '';
  selectedHolidayName: string | null = null;
  draftText = '';
  draftEntryType: DayEntryType = 'event';
  draftTaskPriority: TaskPriority = 'media';
  draftTaskTime = '09:00';
  savingEntry = false;
  entryError = '';
  editingNoteId: string | null = null;
  editNoteDraft = '';
  taskReschedulingId: string | null = null;

  readonly quickEmojis = ['😀', '🎉', '✅', '📌', '❤️', '⭐', '🔥', '💼', '✏️', '🗓️', '☕', '🎯'];
  readonly priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' },
  ];

  
  readonly yearOptions = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - 12 + i);

  readonly monthOptions = Array.from({ length: 12 }, (_, i) => {
    const raw = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date(2000, i, 1));
    const label = raw.charAt(0).toUpperCase() + raw.slice(1);
    return { value: i, label };
  });

  private holidayMaps = new Map<number, Map<string, string>>();

  
  readonly dateFilterOpen = signal(false);

  ngOnInit() {
    this.rebuildCalendar();
    this.loadVisibleNotes();
    this.loadVisibleTasks();
    this.loadOverdueCount();
  }

  isOverdueTask(task: Task): boolean {
    return isTaskOverdue(task);
  }

  get isSelectedToday(): boolean {
    if (!this.selectedKey) return false;
    const today = new Date();
    return this.selectedKey === toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
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

  tasksForSelected(): Task[] {
    if (!this.selectedKey) return [];
    return this.tasksMap[this.selectedKey] ?? [];
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
    this.loadVisibleTasks();
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
    this.loadVisibleTasks();
  }

  setYear(y: number): void {
    this.year = y;
    this.rebuildCalendar();
    this.loadVisibleNotes();
    this.loadVisibleTasks();
  }

  setMonth(m: number): void {
    this.month = m;
    this.rebuildCalendar();
    this.loadVisibleNotes();
    this.loadVisibleTasks();
  }

  goToday(): void {
    const t = new Date();
    this.year = t.getFullYear();
    this.month = t.getMonth();
    this.rebuildCalendar();
    this.loadVisibleNotes();
    this.loadVisibleTasks();
    this.closeDateFilter();
  }

  calendarDropId(dateKey: string): string {
    return `cal-${dateKey}`;
  }

  calendarModalDropId(dateKey: string): string {
    return `cal-modal-${dateKey}`;
  }

  calendarDropIds(): string[] {
    const ids: string[] = [];
    for (const row of this.calendarWeeks) {
      for (const day of row.days) {
        ids.push(this.calendarDropId(day.dateKey));
      }
    }
    if (this.modalOpen && this.selectedKey) {
      ids.push(this.calendarModalDropId(this.selectedKey));
    }
    return ids;
  }

  private dropKeyFromId(containerId: string): string {
    if (containerId.startsWith('cal-modal-')) {
      return containerId.slice('cal-modal-'.length);
    }
    if (containerId.startsWith('cal-')) {
      return containerId.slice(4);
    }
    return '';
  }

  tasksForDateKey(dateKey: string): Task[] {
    if (!this.tasksMap[dateKey]) {
      this.tasksMap[dateKey] = [];
    }
    return this.tasksMap[dateKey];
  }

  onCellClick(cell: CalendarDayCell, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('.dashboard-calendar__task-chip')) return;
    if (target.closest('.cdk-drag-preview')) return;
    this.openDay(cell);
  }

  onCalendarTaskDrop(event: CdkDragDrop<Task[]>, targetDateKey: string): void {
    const sourceKey = this.dropKeyFromId(event.previousContainer.id);

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      this.rebuildCalendar();
      return;
    }

    const task = event.previousContainer.data[event.previousIndex];
    if (!task) return;

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
    this.cleanupEmptyDay(sourceKey);
    this.rebuildCalendar();
    this.rescheduleTask(task, sourceKey, targetDateKey);
  }

  private rescheduleTask(task: Task, fromKey: string, toKey: string): void {
    if (fromKey === toKey) return;
    const dueDate = this.dueDateForDateKey(toKey, task.dueDate);
    this.taskReschedulingId = task.id;
    this.taskService.updateTask(task.id, { dueDate }).subscribe({
      next: (updated) => {
        const list = this.tasksMap[toKey] ?? [];
        const idx = list.findIndex((t) => t.id === task.id);
        if (idx >= 0) {
          list[idx] = updated;
        }
        this.taskReschedulingId = null;
        this.rebuildCalendar();
        this.loadOverdueCount();
      },
      error: () => {
        this.taskReschedulingId = null;
        this.loadVisibleTasks();
      },
    });
  }

  private dueDateForDateKey(dateKey: string, referenceIso: string): string {
    const [y, m, d] = dateKey.split('-').map(Number);
    const ref = new Date(referenceIso);
    const date = new Date(
      y,
      m - 1,
      d,
      ref.getHours(),
      ref.getMinutes(),
      ref.getSeconds(),
      ref.getMilliseconds(),
    );
    return date.toISOString();
  }

  private cleanupEmptyDay(dateKey: string): void {
    if (this.tasksMap[dateKey]?.length === 0) {
      delete this.tasksMap[dateKey];
    }
  }

  openDay(cell: CalendarDayCell): void {
    this.selectedKey = cell.dateKey;
    this.selectedHolidayName = cell.holidayName ?? null;
    this.draftText = '';
    this.draftTaskTime = this.defaultTaskTimeForDateKey(cell.dateKey);
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
    this.draftEntryType = 'event';
    this.draftTaskPriority = 'media';
    this.draftTaskTime = '09:00';
    this.entryError = '';
    this.savingEntry = false;
    this.selectedHolidayName = null;
    this.cancelEditNote();
  }

  setEntryType(type: DayEntryType): void {
    this.draftEntryType = type;
    this.entryError = '';
  }

  formatTaskPriority(priority: Task['priority']): string {
    const map: Record<Task['priority'], string> = {
      baja: 'Baja',
      media: 'Media',
      alta: 'Alta',
      urgente: 'Urgente',
    };
    return map[priority] ?? priority;
  }

  formatTaskStatus(status: Task['status']): string {
    const map: Record<Task['status'], string> = {
      pendiente: 'Pendiente',
      en_proceso: 'En proceso',
      finalizada: 'Finalizada',
    };
    return map[status] ?? status;
  }

  startEditNote(note: DayNote): void {
    this.editingNoteId = note.id;
    this.editNoteDraft = note.text;
  }

  cancelEditNote(): void {
    this.editingNoteId = null;
    this.editNoteDraft = '';
  }

  saveEditNote(): void {
    const text = this.editNoteDraft.trim();
    if (!text || !this.selectedKey || !this.editingNoteId) return;
    const list = this.notesMap[this.selectedKey] ?? [];
    this.notesMap[this.selectedKey] = list.map((n) =>
      n.id === this.editingNoteId ? { ...n, text } : n,
    );
    this.cancelEditNote();
    this.rebuildCalendar();
    this.persistSelectedNotes();
  }

  editTask(task: Task): void {
    this.closeModal();
    this.router.navigate(['/tasks', task.id, 'edit']);
  }

  async deleteTask(task: Task): Promise<void> {
    const ok = await this.confirm.confirm(`¿Eliminar la tarea «${task.title}»?`, {
      title: 'Eliminar tarea',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        if (!this.selectedKey) return;
        const list = (this.tasksMap[this.selectedKey] ?? []).filter((t) => t.id !== task.id);
        if (list.length) {
          this.tasksMap[this.selectedKey] = list;
        } else {
          delete this.tasksMap[this.selectedKey];
        }
        this.rebuildCalendar();
        this.loadOverdueCount();
      },
    });
  }

  insertEmoji(emoji: string): void {
    this.draftText = (this.draftText ?? '') + emoji;
  }

  saveEntry(): void {
    const text = this.draftText.trim();
    if (!text || !this.selectedKey || this.savingEntry) return;
    this.entryError = '';
    if (this.draftEntryType === 'event') {
      this.addEvent(text);
      return;
    }
    this.addTaskEntry(text);
  }

  private addEvent(text: string): void {
    if (!this.selectedKey) return;
    const id = crypto.randomUUID();
    if (!this.notesMap[this.selectedKey]) this.notesMap[this.selectedKey] = [];
    this.notesMap[this.selectedKey].push({ id, text });
    this.draftText = '';
    this.rebuildCalendar();
    this.persistSelectedNotes();
  }

  private addTaskEntry(text: string): void {
    if (!this.selectedKey) return;
    this.savingEntry = true;
    this.taskService
      .createTask({
        title: text,
        dueDate: this.dateKeyToIso(this.selectedKey, false),
        priority: this.draftTaskPriority,
      })
      .subscribe({
        next: (task) => {
          const key = this.selectedKey!;
          this.tasksMap[key] = [...(this.tasksMap[key] ?? []), task];
          this.draftText = '';
          this.savingEntry = false;
          this.rebuildCalendar();
          this.loadOverdueCount();
        },
        error: () => {
          this.savingEntry = false;
          this.entryError =
            'No se pudo crear la tarea. Comprueba que hayas iniciado sesión e inténtalo de nuevo.';
        },
      });
  }

  private loadOverdueCount(): void {
    this.taskService.getTasks(undefined).subscribe({
      next: (tasks) => {
        this.overdueCount = countOverdueTasks(tasks);
      },
      error: () => {
        this.overdueCount = 0;
      },
    });
  }

  removeNote(id: string): void {
    if (!this.selectedKey) return;
    const list = this.notesMap[this.selectedKey] ?? [];
    this.notesMap[this.selectedKey] = list.filter((n) => n.id !== id);
    if (this.notesMap[this.selectedKey].length === 0) {
      delete this.notesMap[this.selectedKey];
    }
    this.rebuildCalendar();
    this.persistSelectedNotes();
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
        this.rebuildCalendar();
      },
      error: () => {
        this.notesMap = {};
        this.rebuildCalendar();
      },
    });
  }

  private loadVisibleTasks(): void {
    const from = this.calendarWeeks[0]?.days[0]?.dateKey;
    const lastWeek = this.calendarWeeks[this.calendarWeeks.length - 1];
    const to = lastWeek?.days[lastWeek.days.length - 1]?.dateKey;
    if (!from || !to) return;

    this.taskService
      .getTasksByDateRange(
        this.dateKeyToIso(from, false),
        this.dateKeyToIso(to, true),
      )
      .subscribe({
        next: (tasks) => {
          this.tasksMap = this.groupTasksByDate(tasks);
          this.rebuildCalendar();
        },
        error: () => {
          this.tasksMap = {};
          this.rebuildCalendar();
        },
      });
  }

  private persistSelectedNotes(): void {
    if (!this.selectedKey) return;
    const notes = this.notesMap[this.selectedKey] ?? [];
    this.calendarNotesService.saveDate(this.selectedKey, notes).subscribe();
  }

  private buildPreview(notes: DayNote[] | undefined): string {
    if (!notes?.length) return '';
    const joined = notes
      .map((n) => n.text.trim())
      .filter(Boolean)
      .join(' ');
    if (!joined) return '';
    return joined.length > 100 ? joined.slice(0, 97) + '…' : joined;
  }

  private buildTaskPreview(tasks: Task[] | undefined): string {
    if (!tasks?.length) return '';
    const firstTitle = tasks[0].title.trim();
    if (tasks.length === 1) return firstTitle;
    return `${firstTitle} +${tasks.length - 1}`;
  }

  private groupTasksByDate(tasks: Task[]): Record<string, Task[]> {
    const grouped: Record<string, Task[]> = {};
    for (const task of tasks) {
      const date = new Date(task.dueDate);
      if (Number.isNaN(date.getTime())) continue;
      const key = toDateKey(date.getFullYear(), date.getMonth(), date.getDate());
      grouped[key] = [...(grouped[key] ?? []), task];
    }
    return grouped;
  }

  private defaultTaskTimeForDateKey(dateKey: string): string {
    const today = new Date();
    const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
    if (dateKey === todayKey) {
      const t = new Date();
      t.setMinutes(0, 0, 0);
      t.setHours(t.getHours() + 1);
      return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    }
    return '09:00';
  }

  private dateKeyToIsoWithTime(dateKey: string, time: string): string {
    const [y, m, d] = dateKey.split('-').map(Number);
    const parts = (time || '09:00').split(':');
    const hh = Number(parts[0]) || 9;
    const mm = Number(parts[1]) || 0;
    return new Date(y, m - 1, d, hh, mm, 0, 0).toISOString();
  }

  private dateKeyToIso(dateKey: string, endOfDay: boolean): string {
    const [y, m, d] = dateKey.split('-').map(Number);
    const date = new Date(
      y,
      m - 1,
      d,
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 999 : 0,
    );
    return date.toISOString();
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
        const tasks = this.tasksMap[key] ?? [];
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
          preview: this.buildPreview(notes),
          taskCount: tasks.length,
          taskPreview: this.buildTaskPreview(tasks),
          tasks,
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
