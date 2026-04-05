import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { AppSidebarComponent, HeaderComponent } from '@shared/layout';

export interface UaiConversation {
  id: string;
  label: string;
}

export interface UaiMessage {
  role: 'user' | 'assistant';
  text: string;
  bullets?: string[];
}

@Component({
  selector: 'app-user-asistente-ia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AppSidebarComponent],
  templateUrl: './user-asistente-ia.component.html',
  styleUrl: './user-asistente-ia.component.scss',
})
export class UserAsistenteIaComponent implements OnInit {
  readonly auth = inject(AuthService);

  avatarUrl = '';
  userHandle = '@Usuario';

  readonly conversations: UaiConversation[] = [
    { id: '1', label: 'Hoy · Semana de parciales' },
    { id: '2', label: 'Ayer · Organización del PDS' },
    { id: '3', label: 'Esta semana · Hábitos de estudio' },
  ];

  readonly selectedId = signal<string>('1');
  readonly draft = signal('');

  /** Mensajes del chat activo (demo inicial según mock) */
  readonly messages = signal<UaiMessage[]>([
    {
      role: 'user',
      text: 'Necesito organizar mi semana de parciales.',
    },
    {
      role: 'assistant',
      text: 'Perfecto, propongo este plan:',
      bullets: [
        'Lunes: repaso capítulos 1–2 y mapa conceptual.',
        'Martes: práctica de ejercicios tipo examen.',
        'Miércoles: simulacro cronometrado y corrección.',
        'Jueves: repaso de errores y dudas.',
        'Viernes: lectura ligera y descanso activo.',
      ],
    },
  ]);

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
  }

  selectConversation(id: string): void {
    this.selectedId.set(id);
    if (id === '1') {
      this.messages.set([
        {
          role: 'user',
          text: 'Necesito organizar mi semana de parciales.',
        },
        {
          role: 'assistant',
          text: 'Perfecto, propongo este plan:',
          bullets: [
            'Lunes: repaso capítulos 1–2 y mapa conceptual.',
            'Martes: práctica de ejercicios tipo examen.',
            'Miércoles: simulacro cronometrado y corrección.',
            'Jueves: repaso de errores y dudas.',
            'Viernes: lectura ligera y descanso activo.',
          ],
        },
      ]);
    } else {
      this.messages.set([
        {
          role: 'assistant',
          text:
            id === '2'
              ? 'Puedes dividir el PDS en bloques de 45 minutos con pausas. ¿Quieres un calendario sugerido?'
              : 'Podemos crear un hábito diario de 25 minutos de repaso. ¿Prefieres mañana o tarde?',
        },
      ]);
    }
  }

  applySuggestion(text: string): void {
    this.draft.set(text);
  }

  send(): void {
    const text = this.draft().trim();
    if (!text) return;
    this.messages.update((m) => [...m, { role: 'user', text }]);
    this.draft.set('');
    window.setTimeout(() => {
      this.messages.update((m) => [
        ...m,
        {
          role: 'assistant',
          text: 'Entendido. Te sugiero priorizar por fecha de entrega y reservar bloques fijos en tu calendario. ¿Quieres que detalle los pasos?',
        },
      ]);
    }, 500);
  }

  onKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      this.send();
    }
  }
}
