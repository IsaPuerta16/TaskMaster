import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { AppSidebarComponent, HeaderComponent } from '@shared/layout';
import {
  AssistantService,
} from './data-access/assistant.service';
import type {
  AssistantConversation,
  AssistantMessage,
} from './data-access/assistant.model';

@Component({
  selector: 'app-user-asistente-ia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AppSidebarComponent],
  templateUrl: './user-asistente-ia.component.html',
  styleUrl: './user-asistente-ia.component.scss',
})
export class UserAsistenteIaComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly assistantService = inject(AssistantService);

  avatarUrl = '';
  userHandle = '@Usuario';
  readonly loading = signal(true);
  readonly sending = signal(false);
  readonly errorMessage = signal('');
  readonly conversations = signal<AssistantConversation[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly draft = signal('');
  readonly messages = signal<AssistantMessage[]>([]);

  readonly quickSuggestions = [
    'Planear mi día',
    'Dividir una tarea grande',
    'Mejorar mi enfoque',
  ];

  ngOnInit(): void {
    const u = this.auth.user();
    const email = u?.email ?? 'usuario@ejemplo.com';
    const local = email.includes('@') ? email.split('@')[0] : email;
    this.userHandle = `@${local}`;
    this.avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u?.id ?? email)}`;
    this.loadConversations();
  }

  selectConversation(id: string): void {
    this.selectedId.set(id);
    this.loadConversationMessages(id);
  }

  /** Rellena y envía (las chips envían al instante). */
  sendSuggestion(text: string): void {
    if (this.sending()) return;
    this.draft.set(text);
    this.send();
  }

  trackMessage(index: number, msg: AssistantMessage): string {
    if (msg.id) {
      return msg.id;
    }
    const stamp = msg.createdAt ?? '';
    return `local-${index}-${msg.role}-${stamp}`;
  }

  send(): void {
    const text = this.draft().trim();
    if (!text || this.sending()) return;
    this.sending.set(true);
    this.errorMessage.set('');
    this.draft.set('');
    this.assistantService
      .sendMessage({
        conversationId: this.selectedId() ?? undefined,
        message: text,
      })
      .subscribe({
        next: (response) => {
          const nextConversation = response.conversation;
          const withoutDupes = this.conversations().filter(
            (conversation) => conversation.id !== nextConversation.id,
          );
          this.conversations.set([nextConversation, ...withoutDupes]);
          this.selectedId.set(nextConversation.id);
          this.messages.update((current) => [
            ...current,
            response.userMessage,
            response.assistantMessage,
          ]);
          this.sending.set(false);
        },
        error: () => {
          this.errorMessage.set(
            'No se pudo enviar el mensaje al asistente. Revisa la configuración de n8n.',
          );
          this.sending.set(false);
        },
      });
  }

  onKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      this.send();
    }
  }

  private loadConversations(): void {
    this.loading.set(true);
    this.assistantService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations.set(conversations);
        if (conversations.length > 0) {
          this.selectedId.set(conversations[0].id);
          this.loadConversationMessages(conversations[0].id);
          return;
        }
        this.messages.set([
          {
            role: 'assistant',
            text:
              'Hola. Cuéntame en qué tarea, proyecto o semana necesitas ayuda y empezamos.',
          },
        ]);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'No se pudieron cargar las conversaciones del asistente.',
        );
        this.loading.set(false);
      },
    });
  }

  private loadConversationMessages(conversationId: string): void {
    this.loading.set(true);
    this.assistantService
      .getConversationMessages(conversationId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (conversation) => {
          this.messages.set(conversation.messages ?? []);
        },
        error: () => {
          this.errorMessage.set(
            'No se pudieron cargar los mensajes de la conversación.',
          );
        },
      });
  }
}
