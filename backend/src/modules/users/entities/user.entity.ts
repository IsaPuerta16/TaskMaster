import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

export enum UserRole {
  ESTUDIANTE = 'estudiante',
  PROFESIONAL = 'profesional',
  OTRO = 'otro',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ name: 'full_name', type: 'text' })
  fullName: string;

  @Column({ name: 'first_name', type: 'text', nullable: true })
  firstName: string | null;

  @Column({ name: 'last_name', type: 'text', nullable: true })
  lastName: string | null;

  @Column({
    type: 'text',
    default: UserRole.ESTUDIANTE,
  })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];
}
