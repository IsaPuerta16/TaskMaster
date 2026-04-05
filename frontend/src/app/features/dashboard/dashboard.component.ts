import { Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { buildColombiaHolidayMap, toDateKey } from '@core/calendar/colombia-holidays';
import { AppSidebarComponent } from '@shared/layout';

const NOTES_STORAGE_KEY = 'taskmaster_calendar_day_notes';

export interface DayNote {
  id: string;
  text: string;
}

export interface CalendarDayCell {
  day: number;
  inMonth: boolean;
  dateKey: string;
  isHoliday: boolean;
  holidayName?: string;
  /** Texto resumido de las notas para mostrar en la celda */
  preview: string;
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
})
export class DashboardComponent implements OnInit {
  year = new Date().getFullYear();
  month = new Date().getMonth();
  calendarWeeks: CalendarWeekRow[] = [];

  /** Notas por YYYY-MM-DD */
  notesMap: Record<string, DayNote[]> = {};

  modalOpen = false;
  selectedKey: string | null = null;
  selectedDateLabel = '';
  selectedHolidayName: string | null = null;
  draftText = '';

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
    this.loadNotes();
    this.rebuildCalendar();
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
  }

  nextMonth(): void {
    if (this.month === 11) {
      this.month = 0;
      this.year++;
    } else {
      this.month++;
    }
    this.rebuildCalendar();
  }

  setYear(y: number): void {
    this.year = y;
    this.rebuildCalendar();
  }

  setMonth(m: number): void {
    this.month = m;
    this.rebuildCalendar();
  }

  goToday(): void {
    const t = new Date();
    this.year = t.getFullYear();
    this.month = t.getMonth();
    this.rebuildCalendar();
    this.closeDateFilter();
  }

  openDay(cell: CalendarDayCell): void {
    this.selectedKey = cell.dateKey;
    this.selectedHolidayName = cell.holidayName ?? null;
    this.draftText = '';
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
    this.selectedHolidayName = null;
  }

  insertEmoji(emoji: string): void {
    this.draftText = (this.draftText ?? '') + emoji;
  }

  addNote(): void {
    const text = this.draftText.trim();
    if (!text || !this.selectedKey) return;
    const id = crypto.randomUUID();
    if (!this.notesMap[this.selectedKey]) this.notesMap[this.selectedKey] = [];
    this.notesMap[this.selectedKey].push({ id, text });
    this.draftText = '';
    this.persistNotes();
    this.rebuildCalendar();
  }

  removeNote(id: string): void {
    if (!this.selectedKey) return;
    const list = this.notesMap[this.selectedKey] ?? [];
    this.notesMap[this.selectedKey] = list.filter((n) => n.id !== id);
    if (this.notesMap[this.selectedKey].length === 0) {
      delete this.notesMap[this.selectedKey];
    }
    this.persistNotes();
    this.rebuildCalendar();
  }

  private loadNotes(): void {
    try {
      const raw = localStorage.getItem(NOTES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, DayNote[]>;
        this.notesMap = parsed && typeof parsed === 'object' ? parsed : {};
      }
    } catch {
      this.notesMap = {};
    }
  }

  private persistNotes(): void {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(this.notesMap));
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

  private buildPreview(notes: DayNote[] | undefined): string {
    if (!notes?.length) return '';
    const joined = notes
      .map((n) => n.text.trim())
      .filter(Boolean)
      .join(' ');
    if (!joined) return '';
    return joined.length > 100 ? joined.slice(0, 97) + '…' : joined;
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
          preview: this.buildPreview(notes),
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
