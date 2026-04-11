import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import type {
  AssistantConversation,
  AssistantConversationDetail,
  AssistantMessage,
  SendAssistantMessageDto,
  SendAssistantMessageResponse,
} from './assistant.model';

@Injectable({ providedIn: 'root' })
export class AssistantService {
  constructor(private readonly http: HttpClient) {}

  getConversations() {
    return this.http.get<AssistantConversation[]>(
      `${environment.apiUrl}/assistant/conversations`,
    );
  }

  getConversationMessages(conversationId: string) {
    return this.http
      .get<AssistantConversationDetail>(
        `${environment.apiUrl}/assistant/conversations/${conversationId}/messages`,
      )
      .pipe(map((detail) => this.normalizeConversationDetail(detail)));
  }

  sendMessage(dto: SendAssistantMessageDto) {
    return this.http.post<SendAssistantMessageResponse>(
      `${environment.apiUrl}/assistant/chat`,
      dto,
    );
  }

  private normalizeConversationDetail(
    detail: AssistantConversationDetail,
  ): AssistantConversationDetail {
    return {
      ...detail,
      messages: this.normalizeMessages(
        (detail as { messages?: unknown }).messages,
      ),
    };
  }

  private normalizeMessages(raw: unknown): AssistantMessage[] {
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw
      .map((item) => this.normalizeMessage(item))
      .filter((m): m is AssistantMessage => m !== null);
  }

  private normalizeMessage(raw: unknown): AssistantMessage | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }
    const r = raw as Record<string, unknown>;
    const roleRaw = r['role'];
    const role =
      roleRaw === 'user'
        ? 'user'
        : roleRaw === 'assistant'
          ? 'assistant'
          : typeof roleRaw === 'string' && roleRaw.toLowerCase() === 'user'
            ? 'user'
            : typeof roleRaw === 'string' && roleRaw.toLowerCase() === 'assistant'
              ? 'assistant'
              : null;

    const textRaw =
      r['text'] ?? r['message'] ?? r['body'] ?? r['content'];
    const text = typeof textRaw === 'string' ? textRaw : '';
    if (!role) {
      return null;
    }

    const id = typeof r['id'] === 'string' ? r['id'] : undefined;
    const createdAtRaw = r['createdAt'] ?? r['created_at'];
    const createdAt =
      typeof createdAtRaw === 'string' ? createdAtRaw : undefined;

    let bullets: string[] | undefined;
    const bulletsRaw = r['bullets'] ?? r['items'] ?? r['steps'];
    if (Array.isArray(bulletsRaw)) {
      bullets = bulletsRaw.filter((item): item is string => typeof item === 'string');
      if (bullets.length === 0) {
        bullets = undefined;
      }
    }

    return { id, role, text, bullets, createdAt };
  }
}
