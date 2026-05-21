import {

  BadRequestException,

  Injectable,

  NotFoundException,

  ForbiddenException,

} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {

  Task,

  TaskPriority,

  TaskRecurrence,

  TaskStatus,

} from '../entities/task.entity';

import { CreateTaskDto } from '../dto/create-task.dto';

import { UpdateTaskDto } from '../dto/update-task.dto';

import { SnoozeTaskDto } from '../dto/snooze-task.dto';



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

      title: dto.title.trim(),

      description: dto.description?.trim() || null,

      dueDate: new Date(dto.dueDate),

      priority: dto.priority ?? TaskPriority.MEDIA,

      status: TaskStatus.PENDIENTE,

      userId,

      project: dto.project?.trim() || null,

      tags: dto.tags ?? [],

      checklist: dto.checklist ?? [],

      recurrence: dto.recurrence ?? TaskRecurrence.NONE,

    });

    return this.taskRepo.save(task);

  }



  async findAll(

    userId: string,

    status?: TaskStatus,

    from?: string,

    to?: string,

    archived?: string,

  ) {

    const qb = this.taskRepo

      .createQueryBuilder('task')

      .where('task.user_id = :userId', { userId })

      .orderBy('task.due_date', 'ASC')

      .addOrderBy(

        "CASE task.priority WHEN 'urgente' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 WHEN 'baja' THEN 4 END",

        'ASC',

      );



    if (archived === 'true') {

      qb.andWhere('task.is_archived = true');

    } else {

      qb.andWhere('task.is_archived = false');

    }



    if (status) {

      qb.andWhere('task.status = :status', { status });

    }



    const fromDate = this.parseOptionalDate(from, 'from');

    const toDate = this.parseOptionalDate(to, 'to');

    if (fromDate) {

      qb.andWhere('task.due_date >= :from', { from: fromDate });

    }

    if (toDate) {

      qb.andWhere('task.due_date <= :to', { to: toDate });

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

    const prevStatus = task.status;



    if (dto.title !== undefined) task.title = dto.title.trim();

    if (dto.description !== undefined) {

      task.description = dto.description?.trim() || null;

    }

    if (dto.dueDate) {

      task.dueDate = new Date(dto.dueDate);

      task.reminderEmailSentAt = null;

    }

    if (dto.priority !== undefined) task.priority = dto.priority;

    if (dto.project !== undefined) task.project = dto.project?.trim() || null;

    if (dto.tags !== undefined) task.tags = dto.tags;

    if (dto.checklist !== undefined) task.checklist = dto.checklist;

    if (dto.recurrence !== undefined) task.recurrence = dto.recurrence;

    if (dto.status !== undefined) task.status = dto.status;



    const saved = await this.taskRepo.save(task);



    if (

      prevStatus !== TaskStatus.FINALIZADA &&

      saved.status === TaskStatus.FINALIZADA &&

      saved.recurrence !== TaskRecurrence.NONE

    ) {

      await this.spawnRecurringCopy(saved);

    }



    return saved;

  }



  async snooze(id: string, userId: string, dto: SnoozeTaskDto) {

    const task = await this.findOne(id, userId);

    const next = new Date(task.dueDate);



    if (dto.preset === 'tomorrow') {

      const t = new Date();

      t.setDate(t.getDate() + 1);

      t.setHours(next.getHours(), next.getMinutes(), 0, 0);

      task.dueDate = t;

    } else if (dto.preset === 'next_week') {

      next.setDate(next.getDate() + 7);

      task.dueDate = next;

    } else {

      const days = dto.days ?? 1;

      next.setDate(next.getDate() + days);

      task.dueDate = next;

    }



    if (task.status === TaskStatus.FINALIZADA) {

      task.status = TaskStatus.PENDIENTE;

    }



    task.reminderEmailSentAt = null;

    return this.taskRepo.save(task);

  }



  async archive(id: string, userId: string) {

    const task = await this.findOne(id, userId);

    task.isArchived = true;

    return this.taskRepo.save(task);

  }



  async remove(id: string, userId: string) {

    const task = await this.findOne(id, userId);

    await this.taskRepo.remove(task);

    return { message: 'Tarea eliminada' };

  }



  async getStats(userId: string) {

    const tasks = await this.taskRepo.find({

      where: { userId, isArchived: false },

    });

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



  private async spawnRecurringCopy(task: Task) {

    const nextDue = new Date(task.dueDate);

    switch (task.recurrence) {

      case TaskRecurrence.DAILY:

        nextDue.setDate(nextDue.getDate() + 1);

        break;

      case TaskRecurrence.WEEKLY:

        nextDue.setDate(nextDue.getDate() + 7);

        break;

      case TaskRecurrence.MONTHLY:

        nextDue.setMonth(nextDue.getMonth() + 1);

        break;

      default:

        return;

    }



    const copy = this.taskRepo.create({

      title: task.title,

      description: task.description,

      dueDate: nextDue,

      priority: task.priority,

      status: TaskStatus.PENDIENTE,

      userId: task.userId,

      project: task.project,

      tags: task.tags ?? [],

      checklist: (task.checklist ?? []).map((item) => ({

        ...item,

        done: false,

      })),

      recurrence: task.recurrence,

    });

    await this.taskRepo.save(copy);

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



  private parseOptionalDate(value: string | undefined, field: string): Date | null {

    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {

      throw new BadRequestException(`La fecha ${field} no es valida`);

    }

    return date;

  }

}


