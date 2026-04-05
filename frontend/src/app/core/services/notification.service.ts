import { Injectable, NgZone, computed, inject, signal } from '@angular/core';
import type { Task } from '@core/models';
import { AppSettingsService } from './app-settings.service';
import { TaskService } from './task.service';

export type NotifFilter = 'todas' | 'pendientes' | 'leidas';

export interface NotificationItem {
  id: string;
  kind: 'warning' | 'target' | 'calendar' | 'streak';
  text: string;
  time: string;
}

export interface NotifPrefs {
  recordatorios: boolean;
  resumenDiario: boolean;
  resumenSemanal: boolean;
  sonidos: boolean;
  /** Notificaciones nativas del navegador (requiere permiso) */
  escritorio: boolean;
}

const PREFS_KEY = 'taskmaster_notif_prefs';
const READ_IDS_KEY = 'taskmaster_notif_read_ids';
/** Usuario apagó el interruptor en la app; no forzar verde aunque el navegador siga con permiso concedido. */
const ESCRITORIO_USER_OFF_KEY = 'taskmaster_escritorio_user_off';

export const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  recordatorios: true,
  resumenDiario: true,
  resumenSemanal: true,
  sonidos: true,
  escritorio: false,
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysFromTodayTo(due: Date, today: Date): number {
  const a = startOfDay(today).getTime();
  const b = startOfDay(due).getTime();
  return Math.round((b - a) / 86400000);
}

function computeStreak(tasks: Task[]): number {
  const doneDays = new Set<string>();
  for (const t of tasks) {
    if (t.status !== 'finalizada') continue;
    const d = new Date(t.updatedAt);
    doneDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (doneDays.has(key)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly appSettings = inject(AppSettingsService);
  private readonly taskService = inject(TaskService);
  private readonly ngZone = inject(NgZone);
  private readonly tasks = signal<Task[]>([]);

  readonly prefs = signal<NotifPrefs>({ ...DEFAULT_NOTIF_PREFS });
  readonly readIds = signal<Set<string>>(new Set());

  readonly items = computed(() => {
    this.appSettings.settings();
    return this.buildItems(this.tasks());
  });

  /** Items respetando preferencias de tipo (recordatorios, resúmenes) */
  readonly itemsRespectingPrefs = computed(() => {
    const p = this.prefs();
    return this.items().filter((i) => {
      if (i.id.startsWith('task-due-') && !p.recordatorios) return false;
      if (i.id === 'agg-completed-today' && !p.resumenDiario) return false;
      if (i.id === 'agg-streak' && !p.resumenSemanal) return false;
      return true;
    });
  });

  readonly unreadCount = computed(() => {
    const ids = this.readIds();
    return this.itemsRespectingPrefs().filter((i) => !ids.has(i.id)).length;
  });

  constructor() {
    this.loadPrefs();
    this.applyEscritorioFromGrantedPermissionOnInit();
    this.syncEscritorioWithBrowserPermission();
    this.loadReadIds();
    this.refreshTasksIfDesktopEnabled();
  }

  /**
   * Si el navegador ya tiene permiso concedido (p. ej. tras recargar la página como pide Chrome)
   * pero `prefs` seguía en false, alineamos el interruptor con el permiso real.
   * Respeta `ESCRITORIO_USER_OFF_KEY` si el usuario desactivó el interruptor en la app.
   */
  private applyEscritorioFromGrantedPermissionOnInit(): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (!window.isSecureContext) return;
    if (Notification.permission !== 'granted') return;
    try {
      if (localStorage.getItem(ESCRITORIO_USER_OFF_KEY) === '1') return;
    } catch {
      /* ignore */
    }
    if (!this.prefs().escritorio) {
      this.prefs.update((p) => ({ ...p, escritorio: true }));
      this.persistPrefs();
    }
  }

  /**
   * Solo si el usuario bloqueó notificaciones en el navegador: apaga la preferencia.
   * No tocar permiso `default` (aún no preguntado) para no desactivar el interruptor al recargar.
   */
  private syncEscritorioWithBrowserPermission(): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'denied') return;
    if (this.prefs().escritorio) {
      this.prefs.update((p) => ({ ...p, escritorio: false }));
      this.persistPrefs();
    }
  }

  /** Carga tareas para poder mostrar notificaciones de escritorio (p. ej. solo en Configuración sin pasar por la lista). */
  refreshTasksIfDesktopEnabled(): void {
    if (typeof window === 'undefined') return;
    if (!this.prefs().escritorio) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    this.taskService.getTasks(undefined).subscribe({
      next: (t) => this.setTasks(t),
    });
  }

  setTasks(tasks: Task[]): void {
    this.tasks.set(tasks);
    this.maybePlaySoundOnNew();
    this.maybeDesktopNotify();
    this.maybeShowDesktopOnboardingIfNoDueTasks();
  }

  markRead(id: string): void {
    this.readIds.update((s) => {
      const next = new Set(s);
      next.add(id);
      return next;
    });
    this.persistRead();
  }

  markAllRead(): void {
    const all = new Set(this.readIds());
    for (const i of this.items()) {
      all.add(i.id);
    }
    this.readIds.set(all);
    this.persistRead();
  }

  togglePref(key: keyof NotifPrefs): void {
    if (key === 'escritorio') {
      const on = !this.prefs().escritorio;
      if (on) {
        this.enableEscritorioFromUserGesture();
      } else {
        this.prefs.update((p) => ({ ...p, escritorio: false }));
        try {
          localStorage.setItem(ESCRITORIO_USER_OFF_KEY, '1');
        } catch {
          /* ignore */
        }
        this.persistPrefs();
      }
      return;
    }
    this.prefs.update((p) => ({ ...p, [key]: !p[key] }));
    this.persistPrefs();
  }

  /**
   * Debe ejecutarse en el mismo turno síncrono que el clic (sin async antes de requestPermission)
   * para que Chrome/Firefox acepten el cuadro de permiso.
   */
  private enableEscritorioFromUserGesture(): void {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }
    if (!window.isSecureContext) {
      return;
    }
    if (Notification.permission === 'denied') {
      return;
    }
    if (Notification.permission === 'granted') {
      // El permiso ya estaba concedido (p. ej. desde el icono del navegador): hay que guardar prefs en true;
      // antes solo cargábamos tareas y el interruptor seguía gris.
      this.ngZone.run(() => {
        this.prefs.update((p) => ({ ...p, escritorio: true }));
        try {
          localStorage.removeItem(ESCRITORIO_USER_OFF_KEY);
        } catch {
          /* ignore */
        }
        this.persistPrefs();
        this.persistEscritorioOnAndLoadTasks();
      });
      return;
    }
    const req = Notification.requestPermission();
    const apply = (perm: NotificationPermission): void => {
      // El callback de la promesa corre fuera de NgZone; sin esto el interruptor no se pinta en verde.
      this.ngZone.run(() => {
        const ok = perm === 'granted';
        this.prefs.update((p) => ({ ...p, escritorio: ok }));
        if (ok) {
          try {
            localStorage.removeItem(ESCRITORIO_USER_OFF_KEY);
          } catch {
            /* ignore */
          }
        }
        this.persistPrefs();
        if (ok) {
          this.persistEscritorioOnAndLoadTasks();
        }
      });
    };
    if (req instanceof Promise) {
      void req.then(apply);
    } else {
      apply(req as NotificationPermission);
    }
  }

  private persistEscritorioOnAndLoadTasks(): void {
    this.taskService.getTasks(undefined).subscribe({
      next: (t) => this.setTasks(t),
    });
  }

  /** Si no hay tareas con vencimiento en ventana, el usuario no veía ninguna notificación y creía que fallaba. */
  private maybeShowDesktopOnboardingIfNoDueTasks(): void {
    if (!this.prefs().escritorio || Notification.permission !== 'granted') return;
    const hasTaskDue = this.items().some((i) => i.id.startsWith('task-due-'));
    if (hasTaskDue) return;
    const tag = 'taskmaster-desktop-onboarding';
    if (this.desktopOnce.has(tag)) return;
    this.desktopOnce.add(tag);
    try {
      const en = this.appSettings.isEnglish();
      new Notification('TaskMaster', {
        body: en
          ? 'Desktop alerts are on. We will notify you when a task is due soon.'
          : 'Avisos de escritorio activados. Te avisaremos cuando una tarea esté próxima a vencer.',
        tag,
      });
    } catch {
      /* ignore */
    }
  }

  /** Para pruebas o flujos que no pasan por el clic (p. ej. futuros botones). */
  async requestDesktopPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (!window.isSecureContext) {
      return false;
    }
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const p = await Notification.requestPermission();
    return p === 'granted';
  }

  private loadPrefs(): void {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<NotifPrefs>;
        this.prefs.set({ ...DEFAULT_NOTIF_PREFS, ...p });
      }
    } catch {
      /* ignore */
    }
  }

  private persistPrefs(): void {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs()));
    } catch {
      /* ignore */
    }
  }

  private loadReadIds(): void {
    try {
      const raw = localStorage.getItem(READ_IDS_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        this.readIds.set(new Set(Array.isArray(arr) ? arr : []));
      }
    } catch {
      /* ignore */
    }
  }

  private persistRead(): void {
    try {
      localStorage.setItem(READ_IDS_KEY, JSON.stringify([...this.readIds()]));
    } catch {
      /* ignore */
    }
  }

  private buildItems(tasks: Task[]): NotificationItem[] {
    const en = this.appSettings.isEnglish();
    const out: NotificationItem[] = [];
    const now = new Date();
    const today = startOfDay(now);

    for (const t of tasks) {
      if (t.status === 'finalizada') continue;
      const due = new Date(t.dueDate);
      if (Number.isNaN(due.getTime())) continue;
      const diff = daysFromTodayTo(due, today);

      let text = '';
      let time = '';
      if (diff < 0) {
        text = en
          ? `Task "${t.title}" is overdue`
          : `Tarea «${t.title}» está vencida`;
        time = en ? 'Needs attention' : 'Requiere atención';
      } else if (diff === 0) {
        text = en
          ? `Task "${t.title}" is due today`
          : `Tarea «${t.title}» vence hoy`;
        time = en ? 'Today' : 'Hoy';
      } else if (diff === 1) {
        text = en
          ? `Task "${t.title}" is due tomorrow`
          : `Tarea «${t.title}» vence mañana`;
        time = en ? 'Tomorrow' : 'Mañana';
      } else if (diff <= 7) {
        text = en
          ? `Task "${t.title}" is due in ${diff} days`
          : `Tarea «${t.title}» vence en ${diff} días`;
        time = this.appSettings.formatDueDateShort(due);
      } else {
        continue;
      }
      out.push({
        id: `task-due-${t.id}`,
        kind: 'warning',
        text,
        time,
      });
    }

    const startToday = startOfDay(now);
    const endToday = new Date(startToday);
    endToday.setDate(endToday.getDate() + 1);

    const completedToday = tasks.filter((t) => {
      if (t.status !== 'finalizada') return false;
      const u = new Date(t.updatedAt);
      return u >= startToday && u < endToday;
    }).length;

    if (completedToday > 0) {
      out.push({
        id: 'agg-completed-today',
        kind: 'target',
        text: en
          ? completedToday === 1
            ? 'You completed 1 task today'
            : `You completed ${completedToday} tasks today`
          : completedToday === 1
            ? 'Completaste 1 tarea hoy'
            : `Completaste ${completedToday} tareas hoy`,
        time: en ? 'Today' : 'Hoy',
      });
    }

    const streak = computeStreak(tasks);
    if (streak >= 2) {
      out.push({
        id: 'agg-streak',
        kind: 'streak',
        text: en
          ? `You're on a ${streak}-day streak completing tasks!`
          : `¡Llevas ${streak} días de racha completando tareas!`,
        time: en ? 'Recent activity' : 'Actividad reciente',
      });
    }

    out.sort((a, b) => {
      const order = { warning: 0, calendar: 1, target: 2, streak: 3 };
      return order[a.kind] - order[b.kind];
    });

    return out;
  }

  private prevUnread = 0;
  private soundInit = false;

  private maybePlaySoundOnNew(): void {
    if (!this.prefs().sonidos) return;
    const n = this.unreadCount();
    if (!this.soundInit) {
      this.soundInit = true;
      this.prevUnread = n;
      return;
    }
    if (n > this.prevUnread) {
      try {
        const ctx = new AudioContext();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = 880;
        g.gain.value = 0.04;
        o.start();
        setTimeout(() => {
          o.stop();
          ctx.close();
        }, 120);
      } catch {
        /* ignore */
      }
    }
    this.prevUnread = n;
  }

  private readonly desktopOnce = new Set<string>();

  private maybeDesktopNotify(): void {
    if (!this.prefs().escritorio || typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }
    if (Notification.permission !== 'granted') return;

    for (const i of this.items()) {
      if (!i.id.startsWith('task-due-')) continue;
      if (this.desktopOnce.has(i.id)) continue;
      this.desktopOnce.add(i.id);
      try {
        new Notification('TaskMaster', { body: i.text, tag: i.id });
      } catch {
        /* ignore */
      }
    }
  }
}
