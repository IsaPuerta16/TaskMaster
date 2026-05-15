import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarLayoutComponent } from '@shared/layout';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarLayoutComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
})
export class PerfilComponent {
  private readonly auth = inject(AuthService);

  nombre   = signal('Daniel');
  apellido = signal('Espinosa');
  correo   = signal(this.auth.user()?.email ?? 'usuario@ejemplo.com');
  rol      = signal('desarrollador');

  readonly roles = [
    { value: 'desarrollador',   label: 'Desarrollador' },
    { value: 'disenador',       label: 'Diseñador' },
    { value: 'manager',         label: 'Manager / PM' },
    { value: 'analista',        label: 'Analista' },
    { value: 'qa',              label: 'QA / Tester' },
    { value: 'otro',            label: 'Otro' },
  ];

  readonly stats = [
    { value: '34', label: 'Tareas completadas', icon: 'check' },
    { value: '4',  label: 'Días de racha',       icon: 'flame' },
    { value: '78%',label: 'Cumplimiento',         icon: 'chart' },
  ];

  saved = false;

  saveProfile() {
    // Future: call API
    this.saved = true;
    setTimeout(() => (this.saved = false), 2500);
  }
}
