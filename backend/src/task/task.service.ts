import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskPriority, TaskStatus } from './task.entity';
import { User } from '../user/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

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
    };
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
