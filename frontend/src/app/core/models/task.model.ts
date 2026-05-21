export type TaskStatus = 'pendiente' | 'en_proceso' | 'finalizada';
export type TaskPriority = 'baja' | 'media' | 'alta' | 'urgente';
export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface TaskChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
  project?: string | null;
  tags?: string[];
  checklist?: TaskChecklistItem[];
  isArchived?: boolean;
  recurrence?: TaskRecurrence;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate: string;
  priority?: TaskPriority;
  project?: string;
  tags?: string[];
  checklist?: TaskChecklistItem[];
  recurrence?: TaskRecurrence;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  streakDays?: number;
  insights?: string[];
}
