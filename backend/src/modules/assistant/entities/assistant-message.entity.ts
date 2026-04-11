import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AssistantConversation } from './assistant-conversation.entity';

export enum AssistantMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

@Entity('assistant_messages')
@Index(['conversationId', 'createdAt'])
export class AssistantMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  @ManyToOne(() => AssistantConversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: AssistantConversation;

  @Column({ type: 'text' })
  role: AssistantMessageRole;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'jsonb', nullable: true, default: null })
  bullets: string[] | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
