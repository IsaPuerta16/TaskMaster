import type { Task } from '@core/models';
import { isTaskOverdue } from '@core/utils/is-task-overdue.util';

const PRIORITY_WEIGHT: Record<Task['priority'], number> = {
  urgente: 4,
  alta: 3,
  media: 2,
  baja: 1,
};

function isDueToday(dueDate: string, today: Date): boolean {
  const d = new Date(dueDate);
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function sortTasksForNow(tasks: Task[], now = new Date()): Task[] {
  return [...tasks]
    .filter((t) => t.status !== 'finalizada' && !t.isArchived)
    .sort((a, b) => {
      const aOver = isTaskOverdue(a, now);
      const bOver = isTaskOverdue(b, now);
      if (aOver !== bOver) return aOver ? -1 : 1;

      const aToday = isDueToday(a.dueDate, now);
      const bToday = isDueToday(b.dueDate, now);
      if (aToday !== bToday) return aToday ? -1 : 1;

      const dateDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (dateDiff !== 0) return dateDiff;

      return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    });
}
