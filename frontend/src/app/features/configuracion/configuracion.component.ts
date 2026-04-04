import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarLayoutComponent } from '@shared/layout';

type Tema = 'claro' | 'oscuro' | 'sistema';
type FontSize = 'pequeno' | 'normal' | 'grande';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarLayoutComponent],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.scss',
})
export class ConfiguracionComponent {
  tema      = signal<Tema>('oscuro');
  fontSize  = signal<FontSize>('normal');
  idioma    = signal('es');
  formatoFecha = signal('DD/MM/AAAA');
  formatoHora  = signal('24h');
  zonaHoraria  = signal('America/Bogota');

  saved = false;

  setTema(t: Tema) { this.tema.set(t); }
  setFontSize(s: FontSize) { this.fontSize.set(s); }

  saveConfig() {
    this.saved = true;
    setTimeout(() => (this.saved = false), 2500);
  }
}
