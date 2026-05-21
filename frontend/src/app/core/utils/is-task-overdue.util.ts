import type { Task } from '@core/models';

export function isTaskOverdue(task: Task, now: Date = new Date()): boolean {
  if (task.status === 'finalizada') return false;
  const due = new Date(task.dueDate);
  return !Number.isNaN(due.getTime()) && due.getTime() < now.getTime();
}

export function countOverdueTasks(tasks: Task[], now: Date = new Date()): number {
  return tasks.filter((t) => isTaskOverdue(t, now)).length;
}
