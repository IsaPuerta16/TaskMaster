import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskPriority, TaskStatus } from '../entities/task.entity';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  [TaskPriority.URGENTE]: 4,
  [TaskPriority.ALTA]: 3,
  [TaskPriority.MEDIA]: 2,
  [TaskPriority.BAJA]: 1,
};

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {}

  async create(userId: string, dto: CreateTaskDto) {
    const task = this.taskRepo.create({
      ...dto,
      dueDate: new Date(dto.dueDate),
      userId,
    });
    return this.taskRepo.save(task);
  }

  async findAll(userId: string, status?: TaskStatus) {
    const qb = this.taskRepo
      .createQueryBuilder('task')
      .where('task.user_id = :userId', { userId })
      .orderBy('task.due_date', 'ASC')
      .addOrderBy("CASE task.priority WHEN 'urgente' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 WHEN 'baja' THEN 4 END", 'ASC');

    if (status) {
      qb.andWhere('task.status = :status', { status });
    }

    const tasks = await qb.getMany();
    return this.sortByPriority(tasks);
  }

  async findOne(id: string, userId: string) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Tarea no encontrada');
    if (task.userId !== userId) throw new ForbiddenException();
    return task;
  }

  async update(id: string, userId: string, dto: UpdateTaskDto) {
    const task = await this.findOne(id, userId);
    if (dto.dueDate) task.dueDate = new Date(dto.dueDate);
    Object.assign(task, dto);
    return this.taskRepo.save(task);
  }

  async remove(id: string, userId: string) {
    const task = await this.findOne(id, userId);
    await this.taskRepo.remove(task);
    return { message: 'Tarea eliminada' };
  }

  async getStats(userId: string) {
    const tasks = await this.taskRepo.find({ where: { userId } });
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === TaskStatus.FINALIZADA).length;
    const pending = tasks.filter((t) => t.status !== TaskStatus.FINALIZADA).length;
    const overdue = tasks.filter(
      (t) =>
        t.status !== TaskStatus.FINALIZADA &&
        new Date(t.dueDate) < new Date(),
    ).length;

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      streakDays: this.computeStreak(tasks),
      insights: this.buildInsights(tasks),
    };
  }

  private buildInsights(tasks: Task[]): string[] {
    const completed = tasks.filter((t) => t.status === TaskStatus.FINALIZADA);
    const pending = tasks.filter((t) => t.status !== TaskStatus.FINALIZADA);
    const insights: string[] = [];

    if (completed.length > 0) {
      const weekdayNames = [
        'domingo',
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
      ] as const;
      const completedByDay = new Map<number, number>();

      for (const task of completed) {
        const day = new Date(task.updatedAt).getDay();
        completedByDay.set(day, (completedByDay.get(day) ?? 0) + 1);
      }

      let bestDay = 0;
      let bestCount = -1;
      for (const [day, count] of completedByDay.entries()) {
        if (count > bestCount) {
          bestDay = day;
          bestCount = count;
        }
      }

      insights.push(
        `Tu día con más tareas completadas es ${weekdayNames[bestDay]}.`,
      );
    }

    const highPriority = tasks.filter(
      (t) => t.priority === TaskPriority.ALTA || t.priority === TaskPriority.URGENTE,
    );

    if (highPriority.length > 0) {
      const onTime = highPriority.filter((t) => {
        if (t.status !== TaskStatus.FINALIZADA) return false;
        return new Date(t.updatedAt).getTime() <= new Date(t.dueDate).getTime();
      }).length;
      const pct = Math.round((onTime / highPriority.length) * 100);
      insights.push(
        `Cumples a tiempo el ${pct}% de tus tareas de prioridad alta o urgente.`,
      );
    }

    if (pending.length > 0) {
      const overdue = pending.filter(
        (t) => new Date(t.dueDate).getTime() < Date.now(),
      ).length;
      if (overdue > 0) {
        insights.push(`Tienes ${overdue} tarea(s) vencida(s) que requieren atención.`);
      } else {
        insights.push('No tienes tareas vencidas en este momento.');
      }
    }

    if (insights.length === 0) {
      insights.push('Aún no hay suficiente actividad para generar insights.');
    }

    return insights.slice(0, 3);
  }

  private computeStreak(tasks: Task[]): number {
    const doneDays = new Set<string>();
    for (const task of tasks) {
      if (task.status !== TaskStatus.FINALIZADA) continue;
      const doneAt = new Date(task.updatedAt);
      doneDays.add(
        `${doneAt.getFullYear()}-${doneAt.getMonth()}-${doneAt.getDate()}`,
      );
    }

    let streak = 0;
    for (let i = 0; i < 400; i++) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
      if (doneDays.has(key)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }

  private sortByPriority(tasks: Task[]) {
    return tasks.sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
    });
  }
}
