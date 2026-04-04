import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent, FooterComponent } from '@shared/layout';

interface Activity {
  id: string;
  label: string;
  theme: 'exercise' | 'collaborate' | 'cook' | 'work';
  icon: 'exercise' | 'collaborate' | 'cook' | 'work';
}

const ACTIVITIES: Activity[] = [
  { id: '1', label: 'Ejercicio', theme: 'exercise', icon: 'exercise' },
  { id: '2', label: 'Colaborar', theme: 'collaborate', icon: 'collaborate' },
  { id: '3', label: 'Cocinar', theme: 'cook', icon: 'cook' },
  { id: '4', label: 'Trabajo', theme: 'work', icon: 'work' },
];

@Component({
  selector: 'app-productividad',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './productividad.component.html',
  styleUrl: './productividad.component.scss',
})
export class ProductividadComponent {
  readonly activities = ACTIVITIES;
  readonly notificationCount = 1;
}
