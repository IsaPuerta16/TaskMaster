import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';
import { AssistantConversation } from '../entities/assistant-conversation.entity';
import {
  AssistantMessage,
  AssistantMessageRole,
} from '../entities/assistant-message.entity';
import {
  normalizeAssistantWebhookReply,
  type AssistantWebhookReply,
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
    const conversation = await this.findConversationOrFail(userId, conversationId);
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
      : await this.createConversation(user.id, this.buildConversationTitle(messageText));

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

    const assistantReply = await this.generateAssistantReply(user, conversation, history, tasks);

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

  private async generateAssistantReply(
    user: User,
    conversation: AssistantConversation,
    history: AssistantMessage[],
    tasks: Task[],
  ): Promise<AssistantReply> {
    const webhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL');

    if (!webhookUrl) {
      return {
        text:
          'El asistente todavía no está conectado a n8n. Agrega `N8N_WEBHOOK_URL` en el backend para activarlo.',
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
        history: history.map((message) => ({
          role: message.role,
          text: message.text,
          bullets: message.bullets ?? [],
          createdAt: message.createdAt,
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
      const name = err && typeof err === 'object' && 'name' in err ? String((err as { name?: string }).name) : '';
      if (name === 'TimeoutError' || name === 'AbortError') {
        return 'timeout' as const;
      }
      return null;
    });

    if (response === 'timeout') {
      return {
        text:
          'n8n tardó demasiado en responder (tiempo agotado). Revisa que el workflow esté activo y que el nodo «Respond to Webhook» devuelva la respuesta.',
      };
    }

    if (!response) {
      return {
        text:
          'No se pudo contactar el workflow de n8n en este momento. Revisa la URL del webhook y que el flujo esté activo.',
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
        text:
          'n8n respondió con JSON inválido. Revisa el nodo «Respond to Webhook» y que devuelva un objeto con el campo «text».',
      };
    }

    return normalizeAssistantWebhookReply(payload);
  }
}
