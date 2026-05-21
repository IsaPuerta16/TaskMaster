import type { Task } from '@core/models';

export function tasksToCsv(tasks: Task[]): string {
  const header = 'titulo,fecha_limite,prioridad,estado,proyecto,tags';
  const rows = tasks.map((t) => {
    const tags = (t.tags ?? []).join(';');
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    return [
      esc(t.title),
      esc(t.dueDate),
      t.priority,
      t.status,
      esc(t.project ?? ''),
      esc(tags),
    ].join(',');
  });
  return [header, ...rows].join('\n');
}

export function downloadTextFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildWeeklyReportText(
  tasks: Task[],
  stats: { completed: number; pending: number; overdue: number; completionRate: number },
): string {
  const lines = [
    'Informe semanal - TaskMaster',
    `Generado: ${new Date().toLocaleString('es-CO')}`,
    '',
    `Completadas: ${stats.completed}`,
    `Pendientes: ${stats.pending}`,
    `Vencidas: ${stats.overdue}`,
    `Cumplimiento: ${stats.completionRate}%`,
    '',
    '--- Tareas activas ---',
  ];
  for (const t of tasks.filter((x) => !x.isArchived)) {
    lines.push(`• [${t.status}] ${t.title} — ${t.dueDate}`);
  }
  return lines.join('\n');
}
