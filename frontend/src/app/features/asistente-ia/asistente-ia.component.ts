import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent, FooterComponent } from '@shared/layout';

@Component({
  selector: 'app-asistente-ia',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './asistente-ia.component.html',
  styleUrl: './asistente-ia.component.scss',
})
export class AsistenteIaComponent {}
