import {

  Entity,

  PrimaryGeneratedColumn,

  Column,

  CreateDateColumn,

  UpdateDateColumn,

  ManyToOne,

  JoinColumn,

} from 'typeorm';

import { User } from '../../users/entities/user.entity';



export enum TaskStatus {

  PENDIENTE = 'pendiente',

  EN_PROCESO = 'en_proceso',

  FINALIZADA = 'finalizada',

}



export enum TaskPriority {

  BAJA = 'baja',

  MEDIA = 'media',

  ALTA = 'alta',

  URGENTE = 'urgente',

}



export enum TaskRecurrence {

  NONE = 'none',

  DAILY = 'daily',

  WEEKLY = 'weekly',

  MONTHLY = 'monthly',

}



export interface TaskChecklistItem {

  id: string;

  text: string;

  done: boolean;

}



@Entity('tasks')

export class Task {

  @PrimaryGeneratedColumn('uuid')

  id: string;



  @Column({ type: 'text' })

  title: string;



  @Column({ type: 'text', nullable: true })

  description: string | null;



  @Column({ name: 'due_date', type: 'timestamptz' })

  dueDate: Date;



  @Column({ name: 'reminder_email_sent_at', type: 'timestamptz', nullable: true })

  reminderEmailSentAt: Date | null;



  @Column({ type: 'varchar', length: 80, nullable: true })

  project: string | null;



  @Column({ type: 'jsonb', default: () => "'[]'" })

  tags: string[];



  @Column({ type: 'jsonb', default: () => "'[]'" })

  checklist: TaskChecklistItem[];



  @Column({ name: 'is_archived', type: 'boolean', default: false })

  isArchived: boolean;



  @Column({ type: 'varchar', length: 16, default: TaskRecurrence.NONE })

  recurrence: TaskRecurrence;



  @Column({

    type: 'enum',

    enumName: 'task_priority_enum',

    enum: TaskPriority,

    default: TaskPriority.MEDIA,

  })

  priority: TaskPriority;



  @Column({

    type: 'enum',

    enumName: 'task_status_enum',

    enum: TaskStatus,

    default: TaskStatus.PENDIENTE,

  })

  status: TaskStatus;



  @Column({ name: 'user_id', type: 'uuid' })

  userId: string;



  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })

  @JoinColumn({ name: 'user_id' })

  user: User;



  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })

  createdAt: Date;



  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })

  updatedAt: Date;

}


