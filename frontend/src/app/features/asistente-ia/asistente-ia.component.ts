import { Component } from '@angular/core';
import { HeaderComponent, FooterComponent } from '@shared/layout';

@Component({
  selector: 'app-asistente-ia',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './asistente-ia.component.html',
  styleUrl: './asistente-ia.component.scss',
})
export class AsistenteIaComponent {}
