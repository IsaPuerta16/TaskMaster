import { effect, Injectable, NgZone, computed, inject, signal } from '@angular/core';
import type { Task } from '@features/tasks/data-access';
import { AppSettingsService, TIMEZONE_IANA } from './app-settings.service';
import { TaskService } from '@features/tasks/data-access';
import { AuthService } from './auth.service';
import { UserSettingsService } from '@features/user-settings/data-access/user-settings.service';
import type {
  NotifPrefs,
  UserSettingsResponse,
} from '@features/user-settings/data-access/user-settings.model';

export type NotifFilter = 'todas' | 'pendientes' | 'leidas';

export interface NotificationItem {
  id: string;
  kind: 'warning' | 'target' | 'calendar' | 'streak';
  text: string;
  time: string;
}

export type { NotifPrefs };

export const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  recordatorios: true,
  resumenDiario: true,
  resumenSemanal: true,
  sonidos: true,
  escritorio: false,
  correo: false,
};

/** Prefijo de IDs de recordatorios por tarea (vencimiento / escalones). */
export const TASK_REMINDER_ID_PREFIX = 'task-rem-';

/** Avisos por calendario: N días antes del día de vencimiento (zona de la cuenta). */
export const NOTIF_REMINDER_DAY_STEPS = [5, 2, 1] as const;

/** Mismo día del vencimiento: avisos cuando quedan ≤ estas horas (la más urgente sustituye a la anterior en UI). */
const NOTIF_REMINDER_HOURS_STEPS = [3, 1] as const;

function dateKeyInTz(d: Date, iana: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: iana,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function calendarDaysBetween(fromKey: string, toKey: string): number {
  const a = new Date(`${fromKey}T12:00:00Z`).getTime();
  const b = new Date(`${toKey}T12:00:00Z`).getTime();
  return Math.round((b - a) / 86400000);
}

function hoursUntilDue(due: Date, now: Date): number {
  return (due.getTime() - now.getTime()) / 3600000;
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
  private readonly auth = inject(AuthService);
  private readonly appSettings = inject(AppSettingsService);
  private readonly taskService = inject(TaskService);
  private readonly userSettingsService = inject(UserSettingsService);
  private readonly ngZone = inject(NgZone);
  private readonly tasks = signal<Task[]>([]);
  private readonly desktopUserOff = signal(false);

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
      if (i.id.startsWith(TASK_REMINDER_ID_PREFIX) && !p.recordatorios) return false;
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
    effect(
      () => {
        const user = this.auth.user();
        if (user) {
          this.loadFromServer();
          return;
        }
        this.resetState();
      },
      { allowSignalWrites: true },
    );
  }

  private loadFromServer(): void {
    this.userSettingsService.getSettings().subscribe({
      next: (snapshot) => this.applySettingsSnapshot(snapshot),
    });
  }

  private applySettingsSnapshot(snapshot: UserSettingsResponse): void {
    this.prefs.set({
      recordatorios: snapshot.notifications.recordatorios,
      resumenDiario: snapshot.notifications.resumenDiario,
      resumenSemanal: snapshot.notifications.resumenSemanal,
      sonidos: snapshot.notifications.sonidos,
      escritorio: snapshot.notifications.escritorio,
      correo: snapshot.notifications.correo ?? false,
    });
    this.readIds.set(new Set(snapshot.notifications.readIds ?? []));
    this.desktopUserOff.set(!!snapshot.notifications.desktopUserOff);
    this.applyEscritorioFromGrantedPermissionOnInit();
    this.syncEscritorioWithBrowserPermission();
    this.refreshTasksIfDesktopEnabled();
  }

  private resetState(): void {
    this.prefs.set({ ...DEFAULT_NOTIF_PREFS });
    this.readIds.set(new Set());
    this.desktopUserOff.set(false);
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
    if (this.desktopUserOff()) return;
    if (!this.prefs().escritorio) {
      this.prefs.update((p) => ({ ...p, escritorio: true }));
      this.persistState();
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
      this.persistState();
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
    this.persistState();
  }

  markAllRead(): void {
    const all = new Set(this.readIds());
    for (const i of this.items()) {
      all.add(i.id);
    }
    this.readIds.set(all);
    this.persistState();
  }

  togglePref(key: keyof NotifPrefs): void {
    if (key === 'escritorio') {
      const on = !this.prefs().escritorio;
      if (on) {
        this.enableEscritorioFromUserGesture();
      } else {
        this.prefs.update((p) => ({ ...p, escritorio: false }));
        this.desktopUserOff.set(true);
        this.persistState();
      }
      return;
    }
    this.prefs.update((p) => ({ ...p, [key]: !p[key] }));
    this.persistState();
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
        this.desktopUserOff.set(false);
        this.persistState();
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
          this.desktopUserOff.set(false);
        }
        this.persistState();
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
    const hasTaskDue = this.items().some((i) => i.id.startsWith(TASK_REMINDER_ID_PREFIX));
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

  private persistState(): void {
    if (!this.auth.isAuthenticated()) return;
    this.userSettingsService
      .patchSettings({
        notifications: {
          ...this.prefs(),
          readIds: [...this.readIds()],
          desktopUserOff: this.desktopUserOff(),
        },
      })
      .subscribe({
        next: (snapshot) => this.applySettingsSnapshot(snapshot),
      });
  }

  private buildItems(tasks: Task[]): NotificationItem[] {
    const en = this.appSettings.isEnglish();
    const out: NotificationItem[] = [];
    const now = new Date();
    const tzKey = this.appSettings.settings().timezone;
    const iana = TIMEZONE_IANA[tzKey] ?? 'America/Bogota';
    const todayKey = dateKeyInTz(now, iana);

    for (const t of tasks) {
      if (t.status === 'finalizada') continue;
      const due = new Date(t.dueDate);
      if (Number.isNaN(due.getTime())) continue;
      const hLeft = hoursUntilDue(due, now);

      if (hLeft < 0) {
        out.push({
          id: `${TASK_REMINDER_ID_PREFIX}overdue-${t.id}`,
          kind: 'warning',
          text: en
            ? `Task "${t.title}" is overdue`
            : `Tarea «${t.title}» está vencida`,
          time: en ? 'Needs attention' : 'Requiere atención',
        });
        continue;
      }

      const dueKey = dateKeyInTz(due, iana);
      const diff = calendarDaysBetween(todayKey, dueKey);

      for (const d of NOTIF_REMINDER_DAY_STEPS) {
        if (diff !== d) continue;
        out.push({
          id: `${TASK_REMINDER_ID_PREFIX}${d}d-${t.id}`,
          kind: 'warning',
          text:
            d === 1
              ? en
                ? `Reminder: "${t.title}" is due tomorrow`
                : `Recordatorio: «${t.title}» vence mañana (1 día antes)`
              : en
                ? `Reminder: "${t.title}" is due in ${d} days`
                : `Recordatorio: «${t.title}» — faltan ${d} días para el vencimiento`,
          time: this.appSettings.formatDueDateShort(due),
        });
      }

      if (diff === 0) {
        if (hLeft <= NOTIF_REMINDER_HOURS_STEPS[1] && hLeft > 0) {
          out.push({
            id: `${TASK_REMINDER_ID_PREFIX}1h-${t.id}`,
            kind: 'warning',
            text: en
              ? `Reminder: "${t.title}" is due in under 1 hour`
              : `Recordatorio: «${t.title}» vence en menos de 1 hora`,
            time: this.appSettings.formatDateTime(t.dueDate),
          });
        } else if (hLeft <= NOTIF_REMINDER_HOURS_STEPS[0] && hLeft > 0) {
          out.push({
            id: `${TASK_REMINDER_ID_PREFIX}3h-${t.id}`,
            kind: 'warning',
            text: en
              ? `Reminder: "${t.title}" is due in under 3 hours`
              : `Recordatorio: «${t.title}» vence en menos de 3 horas`,
            time: this.appSettings.formatDateTime(t.dueDate),
          });
        } else if (hLeft > NOTIF_REMINDER_HOURS_STEPS[0]) {
          out.push({
            id: `${TASK_REMINDER_ID_PREFIX}today-${t.id}`,
            kind: 'calendar',
            text: en
              ? `Reminder: "${t.title}" is due today`
              : `Recordatorio: «${t.title}» vence hoy`,
            time: this.appSettings.formatDateTime(t.dueDate),
          });
        }
      }
    }

    const completedToday = tasks.filter((task) => {
      if (task.status !== 'finalizada') return false;
      return dateKeyInTz(new Date(task.updatedAt), iana) === todayKey;
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
      if (!i.id.startsWith(TASK_REMINDER_ID_PREFIX)) continue;
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
