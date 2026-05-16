import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task, TaskPriority, TaskStatus } from '../../tasks/entities/task.entity';
import { AssistantConversation } from '../entities/assistant-conversation.entity';
import {
  AssistantMessage,
  AssistantMessageRole,
} from '../entities/assistant-message.entity';
import {
  normalizeAssistantWebhookReply,
  type AssistantWebhookReply,
  type TaskAction,
} from '../utils/assistant-webhook-reply.util';

type AssistantReply = AssistantWebhookReply;

@Injectable()
export class AssistantService {
  constructor(
    @InjectRepository(AssistantConversation)
    private readonly conversationRepo: Repository<AssistantConversation>,
    @InjectRepository(AssistantMessage)
    private readonly messageRepo: Repository<AssistantMessage>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly configService: ConfigService,
  ) {}

  async listConversations(userId: string) {
    const conversations = await this.conversationRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });

    return conversations.map((conversation) => ({
      id: conversation.id,
      label: conversation.title,
      updatedAt: conversation.updatedAt,
    }));
  }

  async getConversationMessages(userId: string, conversationId: string) {
    const conversation = await this.findConversationOrFail(
      userId,
      conversationId,
    );
    const messages = await this.messageRepo.find({
      where: { conversationId: conversation.id },
      order: { createdAt: 'ASC' },
    });

    return {
      id: conversation.id,
      label: conversation.title,
      messages: messages.map((message) => ({
        id: message.id,
        role: message.role,
        text: message.text,
        bullets: message.bullets ?? undefined,
        createdAt: message.createdAt,
      })),
    };
  }

  async sendMessage(
    user: User,
    payload: { conversationId?: string; message: string },
  ) {
    const messageText = payload.message.trim();
    if (!messageText) {
      throw new BadRequestException('El mensaje no puede estar vacío');
    }

    const conversation = payload.conversationId
      ? await this.findConversationOrFail(user.id, payload.conversationId)
      : await this.createConversation(
          user.id,
          this.buildConversationTitle(messageText),
        );

    await this.messageRepo.save(
      this.messageRepo.create({
        conversationId: conversation.id,
        role: AssistantMessageRole.USER,
        text: messageText,
        bullets: null,
      }),
    );

    const history = await this.messageRepo.find({
      where: { conversationId: conversation.id },
      order: { createdAt: 'ASC' },
    });
    const tasks = await this.taskRepo.find({
      where: { userId: user.id },
      order: { updatedAt: 'DESC' },
      take: 20,
    });

    const assistantReply = await this.generateAssistantReply(
      user,
      conversation,
      history,
      tasks,
      messageText,
    );

    const actionsExecuted = assistantReply.actions?.length ?? 0;
    if (actionsExecuted > 0) {
      await this.executeActions(user.id, assistantReply.actions!);
    }

    const savedAssistantMessage = await this.messageRepo.save(
      this.messageRepo.create({
        conversationId: conversation.id,
        role: AssistantMessageRole.ASSISTANT,
        text: assistantReply.text,
        bullets: assistantReply.bullets ?? null,
      }),
    );

    await this.conversationRepo.update(
      { id: conversation.id },
      { title: conversation.title },
    );

    return {
      conversation: {
        id: conversation.id,
        label: conversation.title,
      },
      userMessage: {
        role: AssistantMessageRole.USER,
        text: messageText,
      },
      assistantMessage: {
        id: savedAssistantMessage.id,
        role: savedAssistantMessage.role,
        text: savedAssistantMessage.text,
        bullets: savedAssistantMessage.bullets ?? undefined,
        createdAt: savedAssistantMessage.createdAt,
      },
      actionsExecuted: actionsExecuted > 0 ? actionsExecuted : undefined,
    };
  }

  private async createConversation(userId: string, title: string) {
    return this.conversationRepo.save(
      this.conversationRepo.create({
        userId,
        title,
      }),
    );
  }

  private async findConversationOrFail(userId: string, conversationId: string) {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId, userId },
    });
    if (!conversation) {
      throw new BadRequestException('Conversación no encontrada');
    }
    return conversation;
  }

  private buildConversationTitle(message: string) {
    const clean = message.replace(/\s+/g, ' ').trim();
    return clean.length > 48 ? `${clean.slice(0, 45)}...` : clean;
  }

  private async executeActions(userId: string, actions: TaskAction[]) {
    for (const action of actions) {
      if (action.type === 'create_task' && action.title) {
        await this.taskRepo.save(
          this.taskRepo.create({
            userId,
            title: action.title,
            description: action.description ?? null,
            dueDate: action.dueDate ? new Date(action.dueDate) : new Date(),
            priority: this.parsePriority(action.priority),
            status: TaskStatus.PENDIENTE,
          }),
        );
      } else if (action.type === 'update_task' && action.taskId) {
        const task = await this.taskRepo.findOne({
          where: { id: action.taskId, userId },
        });
        if (!task) continue;
        const updates: Partial<Task> = {};
        if (action.title) updates.title = action.title;
        if (action.dueDate) updates.dueDate = new Date(action.dueDate);
        if (action.priority) updates.priority = this.parsePriority(action.priority);
        if (action.status) updates.status = this.parseStatus(action.status);
        if (action.description !== undefined) updates.description = action.description;
        await this.taskRepo.update({ id: action.taskId }, updates);
      }
    }
  }

  private parsePriority(value?: string): TaskPriority {
    const map: Record<string, TaskPriority> = {
      urgente: TaskPriority.URGENTE,
      alta: TaskPriority.ALTA,
      baja: TaskPriority.BAJA,
      media: TaskPriority.MEDIA,
    };
    return map[value ?? ''] ?? TaskPriority.MEDIA;
  }

  private parseStatus(value?: string): TaskStatus {
    const map: Record<string, TaskStatus> = {
      en_proceso: TaskStatus.EN_PROCESO,
      finalizada: TaskStatus.FINALIZADA,
      pendiente: TaskStatus.PENDIENTE,
    };
    return map[value ?? ''] ?? TaskStatus.PENDIENTE;
  }

  async generateRoutine(user: User) {
    const webhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL');

    if (!webhookUrl) {
      return {
        text: 'El agente de rutina no está conectado a n8n. Agrega `N8N_WEBHOOK_URL` en el backend.',
      };
    }

    const baseN8nUrl = webhookUrl.split('/webhook/')[0];
    const routineWebhookUrl = `${baseN8nUrl}/webhook/routine-agent`;

    const tasks = await this.taskRepo.find({
      where: { userId: user.id },
      order: { dueDate: 'ASC' },
    });

    const webhookTimeoutMs = Number(
      this.configService.get<string>('N8N_WEBHOOK_TIMEOUT_MS') ?? '30000',
    );
    const timeoutMs =
      Number.isFinite(webhookTimeoutMs) && webhookTimeoutMs > 0
        ? webhookTimeoutMs
        : 30000;

    const response = await fetch(routineWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tasks: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          dueDate: t.dueDate,
          priority: t.priority,
          status: t.status,
        })),
      }),
    }).catch((err: unknown) => {
      const name =
        err && typeof err === 'object' && 'name' in err
          ? String((err as { name?: string }).name)
          : '';
      if (name === 'TimeoutError' || name === 'AbortError') {
        return 'timeout' as const;
      }
      return null;
    });

    if (response === 'timeout') {
      return {
        text: 'El agente tardó demasiado en responder. Revisa que n8n esté activo.',
      };
    }

    if (!response) {
      return {
        text: 'No se pudo contactar el agente de n8n. Revisa la URL del webhook.',
      };
    }

    if (!response.ok) {
      return {
        text: `Error del agente (${response.status}). Intenta más tarde.`,
      };
    }

    const payload = await response.json().catch(() => null);
    if (!payload) {
      return {
        text: 'El agente respondió con un formato inválido.',
      };
    }

    return normalizeAssistantWebhookReply(payload);
  }

  private async generateAssistantReply(
    user: User,
    conversation: AssistantConversation,
    history: AssistantMessage[],
    tasks: Task[],
    currentMessage: string,
  ): Promise<AssistantReply> {
    const webhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL');

    if (!webhookUrl) {
      return {
        text: 'El asistente todavía no está conectado a n8n. Agrega `N8N_WEBHOOK_URL` en el backend para activarlo.',
      };
    }

    const webhookTimeoutMs = Number(
      this.configService.get<string>('N8N_WEBHOOK_TIMEOUT_MS') ?? '25000',
    );
    const timeoutMs =
      Number.isFinite(webhookTimeoutMs) && webhookTimeoutMs > 0
        ? webhookTimeoutMs
        : 25000;

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        conversation: {
          id: conversation.id,
          title: conversation.title,
        },
        currentMessage,
        history: history
          .filter((m) => m.role !== AssistantMessageRole.USER || m.text !== currentMessage)
          .map((message) => ({
            role: message.role,
            text: message.text,
          })),
        tasks: tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
          status: task.status,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        })),
      }),
    }).catch((err: unknown) => {
      const name =
        err && typeof err === 'object' && 'name' in err
          ? String((err as { name?: string }).name)
          : '';
      if (name === 'TimeoutError' || name === 'AbortError') {
        return 'timeout' as const;
      }
      return null;
    });

    if (response === 'timeout') {
      return {
        text: 'n8n tardó demasiado en responder (tiempo agotado). Revisa que el workflow esté activo y que el nodo «Respond to Webhook» devuelva la respuesta.',
      };
    }

    if (!response) {
      return {
        text: 'No se pudo contactar el workflow de n8n en este momento. Revisa la URL del webhook y que el flujo esté activo.',
      };
    }

    if (!response.ok) {
      return {
        text: `n8n respondió con error (${response.status}). Revisa el workflow del asistente.`,
      };
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      return {
        text: text.trim() || 'n8n respondió sin contenido útil.',
      };
    }

    const payload = await response.json().catch(() => null);
    if (!payload) {
      return {
        text: 'n8n respondió con JSON inválido. Revisa el nodo «Respond to Webhook» y que devuelva un objeto con el campo «text».',
      };
    }

    return normalizeAssistantWebhookReply(payload);
  }
}
