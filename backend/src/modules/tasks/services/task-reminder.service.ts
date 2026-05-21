import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, Repository } from 'typeorm';

import { Task, TaskStatus } from '../entities/task.entity';
import { MailService } from '../../mail/services/mail.service';

@Injectable()
export class TaskReminderService {
  private readonly logger = new Logger(TaskReminderService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async sendTaskReminders(): Promise<void> {
    const now = new Date();

    const reminderLimit = new Date();
    reminderLimit.setHours(reminderLimit.getHours() + 24);

    const tasks = await this.taskRepository.find({
      where: [
        {
          status: TaskStatus.PENDIENTE,
          isArchived: false,
          reminderEmailSentAt: IsNull(),
          dueDate: Between(now, reminderLimit),
        },
        {
          status: TaskStatus.EN_PROCESO,
          isArchived: false,
          reminderEmailSentAt: IsNull(),
          dueDate: Between(now, reminderLimit),
        },
      ],
      relations: {
        user: true,
      },
    });

    if (tasks.length === 0) {
      return;
    }

    this.logger.log(`Tareas próximas a vencer encontradas: ${tasks.length}`);

    for (const task of tasks) {
      try {
        if (!task.user?.email) {
          continue;
        }

        await this.mailService.sendTaskReminderEmail({
          to: task.user.email,
          userName: task.user.fullName ?? task.user.firstName ?? 'usuario',
          taskTitle: task.title,
          dueDate: task.dueDate,
        });

        task.reminderEmailSentAt = new Date();

        await this.taskRepository.save(task);

        this.logger.log(
          `Recordatorio enviado para la tarea ${task.id} al correo ${task.user.email}`,
        );
      } catch (error) {
        this.logger.error(
          `Error enviando recordatorio para la tarea ${task.id}`,
          error,
        );
      }
    }
  }
}
