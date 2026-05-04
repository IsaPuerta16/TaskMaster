import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../../mail/mail.service';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  UserSettings,
  type StoredAppSettings,
  type StoredNotificationSettings,
} from '../settings/entities/user-settings.entity';
import { SettingsService } from '../settings/services/settings.service';

const TZ_MAP: Record<string, string> = {
  america_bogota: 'America/Bogota',
  america_mexico: 'America/Mexico_City',
  europe_madrid: 'Europe/Madrid',
};

const DIGEST_COOLDOWN_MS = 20 * 60 * 60 * 1000;

/** Alineado con el centro de notificaciones en la app. */
const DIGEST_REMINDER_DAYS = [5, 2, 1] as const;
const DIGEST_REMINDER_HOURS = [3, 1] as const;

function hoursUntilDue(due: Date, now: Date): number {
  return (due.getTime() - now.getTime()) / 3600000;
}

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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function startOfDayKeyInTz(now: Date, iana: string): string {
  return dateKeyInTz(now, iana);
}

function computeStreak(tasks: Task[]): number {
  const doneDays = new Set<string>();
  for (const t of tasks) {
    if (t.status !== TaskStatus.FINALIZADA) continue;
    const d = new Date(t.updatedAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    doneDays.add(key);
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

@Injectable()
export class NotificationDigestService {
  private readonly log = new Logger(NotificationDigestService.name);

  constructor(
    private readonly mail: MailService,
    private readonly config: ConfigService,
    private readonly settingsService: SettingsService,
    @InjectRepository(UserSettings)
    private readonly settingsRepo: Repository<UserSettings>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async runDailyDigest(): Promise<void> {
    const enabled = (this.config.get<string>('EMAIL_DIGEST_ENABLED') ?? 'true').toLowerCase() !== 'false';
    if (!enabled) {
      return;
    }
    if (!this.mail.isEnabled()) {
      return;
    }

    const rows = await this.settingsRepo.find({ relations: ['user'] });
    for (const row of rows) {
      const notif: StoredNotificationSettings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...row.notifications,
      };
      if (!notif.correo) continue;
      const user = row.user;
      if (!user?.email) continue;

      if (this.shouldSkipForCadence(notif.lastDigestEmailAt)) continue;

      const app: StoredAppSettings = {
        ...DEFAULT_APP_SETTINGS,
        ...row.appSettings,
      };
      const iana = TZ_MAP[app.timezone] ?? 'America/Bogota';
      const en = app.idioma === 'en';

      const tasks = await this.taskRepo.find({
        where: { userId: row.userId },
        order: { dueDate: 'ASC' },
      });

      const { subject, text, html, hasContent } = this.buildDigest({ tasks, iana, notif, en });
      if (!hasContent) continue;

      const ok = await this.mail.sendMail({ to: user.email, subject, text, html });
      if (ok) {
        await this.settingsService.markDigestEmailSent(row.userId);
        this.log.log(`Digest enviado a ${user.email}`);
      }
    }
  }

  private shouldSkipForCadence(lastIso?: string | null): boolean {
    if (!lastIso) return false;
    const t = new Date(lastIso).getTime();
    if (Number.isNaN(t)) return false;
    return Date.now() - t < DIGEST_COOLDOWN_MS;
  }

  private buildDigest(params: {
    tasks: Task[];
    iana: string;
    notif: StoredNotificationSettings;
    en: boolean;
  }): { subject: string; text: string; html: string; hasContent: boolean } {
    const { tasks, iana, notif, en } = params;
    const now = new Date();
    const todayKey = startOfDayKeyInTz(now, iana);

    const reminderLines: string[] = [];
    const reminderHtml: string[] = [];

    if (notif.recordatorios) {
      for (const t of tasks) {
        if (t.status === TaskStatus.FINALIZADA) continue;
        const due = new Date(t.dueDate);
        if (Number.isNaN(due.getTime())) continue;
        const hLeft = hoursUntilDue(due, now);

        const pushLine = (line: string) => {
          reminderLines.push(line);
          reminderHtml.push(`<li>${escapeHtml(line.replace(/^• /, ''))}</li>`);
        };

        if (hLeft < 0) {
          pushLine(en ? `• "${t.title}" is overdue` : `• «${t.title}» está vencida`);
          continue;
        }

        const dueKey = dateKeyInTz(due, iana);
        const diff = calendarDaysBetween(todayKey, dueKey);

        for (const d of DIGEST_REMINDER_DAYS) {
          if (diff !== d) continue;
          const line =
            d === 1
              ? en
                ? `• Reminder: "${t.title}" is due tomorrow`
                : `• Recordatorio: «${t.title}» vence mañana (1 día antes)`
              : en
                ? `• Reminder: "${t.title}" in ${d} days`
                : `• Recordatorio: «${t.title}» — faltan ${d} días`;
          pushLine(line);
        }

        if (diff === 0) {
          if (hLeft <= DIGEST_REMINDER_HOURS[1] && hLeft > 0) {
            pushLine(
              en
                ? `• Reminder: "${t.title}" in under 1 hour`
                : `• Recordatorio: «${t.title}» vence en menos de 1 hora`,
            );
          } else if (hLeft <= DIGEST_REMINDER_HOURS[0] && hLeft > 0) {
            pushLine(
              en
                ? `• Reminder: "${t.title}" in under 3 hours`
                : `• Recordatorio: «${t.title}» vence en menos de 3 horas`,
            );
          } else if (hLeft > DIGEST_REMINDER_HOURS[0]) {
            pushLine(en ? `• Reminder: "${t.title}" is due today` : `• Recordatorio: «${t.title}» vence hoy`);
          }
        }
      }
    }

    let summaryLine = '';
    let summaryHtml = '';
    if (notif.resumenDiario) {
      const completedToday = tasks.filter((t) => {
        if (t.status !== TaskStatus.FINALIZADA) return false;
        return dateKeyInTz(new Date(t.updatedAt), iana) === todayKey;
      }).length;
      if (completedToday > 0) {
        summaryLine =
          completedToday === 1
            ? en
              ? '• You completed 1 task today'
              : '• Completaste 1 tarea hoy'
            : en
              ? `• You completed ${completedToday} tasks today`
              : `• Completaste ${completedToday} tareas hoy`;
        summaryHtml = `<p>${escapeHtml(summaryLine.replace(/^• /, ''))}</p>`;
      }
    }

    let streakLine = '';
    let streakHtml = '';
    if (notif.resumenSemanal) {
      const streak = computeStreak(tasks);
      if (streak >= 2) {
        streakLine = en
          ? `• You're on a ${streak}-day streak completing tasks`
          : `• Llevas ${streak} días de racha completando tareas`;
        streakHtml = `<p>${escapeHtml(streakLine.replace(/^• /, ''))}</p>`;
      }
    }

    const subject = en ? 'TaskMaster — Task summary' : 'TaskMaster — Resumen de tareas';

    const sections: string[] = [];
    const sectionsHtml: string[] = [];

    if (reminderLines.length) {
      sections.push(en ? 'Upcoming & due tasks:' : 'Vencimientos y próximas tareas:');
      sections.push(...reminderLines);
      sectionsHtml.push(
        `<h2 style="font-size:15px;margin:16px 0 8px;">${en ? 'Tasks' : 'Tareas'}</h2><ul>${reminderHtml.join('')}</ul>`,
      );
    }
    if (summaryLine) {
      sections.push(summaryLine);
      sectionsHtml.push(`<h2 style="font-size:15px;margin:16px 0 8px;">${en ? 'Today' : 'Hoy'}</h2>${summaryHtml}`);
    }
    if (streakLine) {
      sections.push(streakLine);
      sectionsHtml.push(`<h2 style="font-size:15px;margin:16px 0 8px;">${en ? 'Streak' : 'Racha'}</h2>${streakHtml}`);
    }

    const intro = en
      ? 'Here is your TaskMaster notification summary.'
      : 'Aquí tienes el resumen de notificaciones de TaskMaster.';

    const footer = en
      ? 'You can change this in Settings → Notifications.'
      : 'Puedes cambiar esto en Configuración → Notificaciones.';

    const text =
      sections.length === 0
        ? `${intro}\n\n${en ? 'No pending items for this summary.' : 'No hay elementos para este resumen.'}\n\n${footer}`
        : `${intro}\n\n${sections.join('\n')}\n\n${footer}`;

    const htmlBody =
      sectionsHtml.length === 0
        ? `<p>${escapeHtml(intro)}</p><p>${en ? 'No pending items.' : 'Sin elementos en este resumen.'}</p><p>${escapeHtml(footer)}</p>`
        : `<p>${escapeHtml(intro)}</p>${sectionsHtml.join('')}<p style="color:#64748b;font-size:13px;margin-top:20px;">${escapeHtml(footer)}</p>`;

    const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.45;color:#0f172a;">${htmlBody}</body></html>`;

    const hasContent =
      reminderLines.length > 0 || Boolean(summaryLine) || Boolean(streakLine);

    return { subject, text, html, hasContent };
  }
}
