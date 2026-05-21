import { Component, HostListener, OnInit, computed, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { AppSettingsService } from '@core/services/app-settings.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { UserAvatarService } from '@core/services/user-avatar.service';
import { AppSidebarComponent } from '@shared/layout';
import {
  AssistantService,
} from './data-access/assistant.service';
import type {
  AssistantConversation,
  AssistantMessage,
} from './data-access/assistant.model';
import { previewConversationTitle } from './conversation-title';

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
  private readonly appSettings = inject(AppSettingsService);
  private readonly userAvatar = inject(UserAvatarService);

  readonly U = computed(() => this.appSettings.ui().userAsistente);

  avatarUrl = '';
  userHandle = '@Usuario';
  readonly loading = signal(true);
  readonly sending = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly errorMessage = signal('');
  readonly conversations = signal<AssistantConversation[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly openMenuId = signal<string | null>(null);
  readonly draft = signal('');
  readonly messages = signal<AssistantMessage[]>([]);

  @ViewChild('chatScroll') private chatScrollRef!: ElementRef<HTMLDivElement>;

  readonly quickSuggestions = [
    {
      label: 'Planear mi día',
      prompt: 'Quiero planear mi día de hoy. Analiza todas mis tareas, prioriza las más urgentes o próximas a vencer, sugiere en qué orden abordarlas y dame consejos concretos para mantener el enfoque y ser productivo durante el día.',
    },
  ];

  ngOnInit(): void {
    const u = this.auth.user();
    const email = u?.email ?? 'usuario@ejemplo.com';
    const local = email.includes('@') ? email.split('@')[0] : email;
    this.userHandle = `@${local}`;
    this.avatarUrl = this.userAvatar.urlFor(u);
    this.loadConversations();
  }

  @HostListener('document:click')
  closeConversationMenu(): void {
    this.openMenuId.set(null);
  }

  
  isDraftChat(): boolean {
    return this.selectedId() === null;
  }

  draftChatLabel(): string {
    const preview = previewConversationTitle(this.draft());
    return preview || this.U().draftChat;
  }

  startNewChat(): void {
    this.selectedId.set(null);
    this.openMenuId.set(null);
    this.errorMessage.set('');
    this.draft.set('');
    this.messages.set([this.buildWelcomeMessage()]);
    this.loading.set(false);
  }

  selectConversation(id: string): void {
    if (this.selectedId() === id) {
      this.openMenuId.set(null);
      return;
    }
    this.selectedId.set(id);
    this.openMenuId.set(null);
    this.loadConversationMessages(id);
  }

  toggleConversationMenu(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  deleteConversation(id: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.deletingId()) return;
    this.deletingId.set(id);
    this.errorMessage.set('');
    this.assistantService
      .deleteConversation(id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => {
          const remaining = this.conversations().filter(
            (conversation) => conversation.id !== id,
          );
          this.conversations.set(remaining);
          this.openMenuId.set(null);

          if (this.selectedId() !== id) {
            return;
          }

          if (remaining.length > 0) {
            this.selectedId.set(remaining[0].id);
            this.loadConversationMessages(remaining[0].id);
            return;
          }

          this.selectedId.set(null);
          this.messages.set([this.buildWelcomeMessage()]);
        },
        error: () => {
          this.errorMessage.set('No se pudo eliminar la conversacion.');
        },
      });
  }

  sendSuggestion(prompt: string): void {
    if (this.sending()) return;
    this.draft.set(prompt);
    this.send();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.chatScrollRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
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
    const conversationId = this.selectedId();
    const userBubble: AssistantMessage = { role: 'user', text };

    this.sending.set(true);
    this.errorMessage.set('');
    this.draft.set('');
    if (conversationId === null) {
      this.messages.set([userBubble]);
    } else {
      this.messages.update((current) => [...current, userBubble]);
    }
    this.scrollToBottom();

    this.assistantService
      .sendMessage({
        conversationId: conversationId ?? undefined,
        message: text,
      })
      .subscribe({
        next: (response) => {
          const nextConversation = response.conversation;
          const withoutDupes = this.conversations().filter(
            (c) => c.id !== nextConversation.id,
          );
          this.conversations.set([nextConversation, ...withoutDupes]);
          this.selectedId.set(nextConversation.id);
          this.messages.set([
            response.userMessage,
            response.assistantMessage,
          ]);
          this.sending.set(false);
          this.scrollToBottom();
        },
        error: () => {
          this.errorMessage.set(
            'No se pudo enviar el mensaje al asistente. Revisa la configuración de n8n.',
          );
          if (conversationId === null) {
            this.messages.set([this.buildWelcomeMessage()]);
          } else {
            this.messages.update((current) =>
              current.filter((m) => m !== userBubble),
            );
          }
          this.draft.set(text);
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
        this.selectedId.set(null);
        this.messages.set([this.buildWelcomeMessage()]);
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
          if (this.selectedId() !== conversationId) {
            return;
          }
          this.messages.set(conversation.messages ?? []);
          this.scrollToBottom();
        },
        error: () => {
          this.errorMessage.set(
            'No se pudieron cargar los mensajes de la conversación.',
          );
        },
      });
  }

  private buildWelcomeMessage(): AssistantMessage {
    return {
      role: 'assistant',
      text:
        'Hola. Cuentame en que tarea, proyecto o semana necesitas ayuda y empezamos.',
    };
  }
}
