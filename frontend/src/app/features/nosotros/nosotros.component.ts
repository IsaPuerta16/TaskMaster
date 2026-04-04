import { Component } from '@angular/core';
import { HeaderComponent, FooterComponent } from '@shared/layout';

/** Avatares ilustrados (DiceBear, estilo cartoon); cada seed genera un personaje estable. */
function avatarCartoon(seed: string): string {
  const params = new URLSearchParams({
    seed,
    size: '128',
    radius: '50',
  });
  return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;
}

export interface TeamMember {
  name: string;
  role: string;
  variant: 'a' | 'b' | 'c' | 'd';
  avatarUrl: string;
}

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.scss',
})
export class NosotrosComponent {
  readonly team: TeamMember[] = [
    {
      name: 'Rafael Montoya Ocampo',
      role: 'Lider de proyecto',
      variant: 'a',
      avatarUrl: avatarCartoon('Rafael Montoya Ocampo'),
    },
    {
      name: 'Isabela Puerta Pérez',
      role: 'Desarrolladora Frontend',
      variant: 'b',
      avatarUrl: avatarCartoon('Isabela Puerta Pérez'),
    },
    {
      name: 'Darwin Gonzalez Granados',
      role: 'Desarrollador Backend',
      variant: 'c',
      avatarUrl: avatarCartoon('Darwin Gonzalez Granados'),
    },
    {
      name: 'Daniel Felipe Espitia',
      role: 'Especialista en IA y Testing',
      variant: 'd',
      avatarUrl: avatarCartoon('Daniel Felipe Espitia'),
    },
  ];
}
