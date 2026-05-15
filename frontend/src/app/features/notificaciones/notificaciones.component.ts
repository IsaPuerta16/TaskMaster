import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarLayoutComponent } from '@shared/layout';

type Tab = 'todos' | 'pendientes' | 'leidos';

interface AppNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'reminder' | 'summary' | 'alert';
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarLayoutComponent],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.scss',
})
export class NotificacionesComponent {
  activeTab = signal<Tab>('todos');

  allNotifications = signal<AppNotification[]>([
    { id: 1, title: 'Tarea próxima a vencer', message: 'La tarea "Revisar documentación" vence mañana.', time: 'Hace 10 min', read: false, type: 'reminder' },
    { id: 2, title: 'Resumen semanal',         message: 'Esta semana completaste 8 de 12 tareas programadas.', time: 'Hace 2 horas', read: false, type: 'summary' },
    { id: 3, title: 'Tarea vencida',           message: 'La tarea "Informe mensual" venció ayer sin completarse.', time: 'Ayer', read: false, type: 'alert' },
    { id: 4, title: 'Resumen diario',          message: 'Tienes 5 tareas pendientes para hoy.', time: 'Ayer', read: true, type: 'summary' },
    { id: 5, title: 'Recordatorio',            message: 'Reunión de equipo en 1 hora — sala virtual.', time: 'Hace 3 días', read: true, type: 'reminder' },
  ]);

  filtered = computed(() => {
    const tab = this.activeTab();
    const all = this.allNotifications();
    if (tab === 'pendientes') return all.filter(n => !n.read);
    if (tab === 'leidos')     return all.filter(n => n.read);
    return all;
  });

  prefs = {
    vencimiento:    true,
    resumenDiario:  false,
    resumenSemanal: true,
    sonidos:        false,
  };

  setTab(tab: Tab) { this.activeTab.set(tab); }

  markRead(id: number) {
    this.allNotifications.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllRead() {
    this.allNotifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  unreadCount = computed(() => this.allNotifications().filter(n => !n.read).length);
}
