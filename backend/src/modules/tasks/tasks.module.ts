import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TaskController } from './controllers/task.controller';
import { TaskService } from './services/task.service';
import { MailModule } from '../mail/mail.module';
import { TaskReminderService } from './services/task-reminder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), 
  MailModule
],
  controllers: [TaskController],
  providers: [
    TaskService,
    TaskReminderService
  ],
})
export class TasksModule {}
