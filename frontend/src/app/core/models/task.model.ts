export type TaskStatus = 'pendiente' | 'en_proceso' | 'finalizada';
export type TaskPriority = 'baja' | 'media' | 'alta' | 'urgente';

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
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate: string;
  priority?: TaskPriority;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
}
