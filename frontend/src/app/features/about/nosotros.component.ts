import { Component, computed, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FooterComponent } from '@shared/layout';
import { AppSettingsService } from '@core/services/app-settings.service';

/** Avatares ilustrados (DiceBear, estilo cartoon); cada seed genera un personaje estable. */
function avatarCartoon(seed: string): string {
  const params = new URLSearchParams({
    seed,
    size: '128',
    radius: '50',
  });
  return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;
}

const VARIANTS = ['a', 'b', 'c', 'd'] as const;

export interface TeamMemberView {
  name: string;
  role: string;
  variant: (typeof VARIANTS)[number];
  avatarUrl: string;
}

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [FooterComponent],
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.scss',
})
export class NosotrosComponent {
  private readonly sanitizer = inject(DomSanitizer);
  readonly appSettings = inject(AppSettingsService);
  readonly F = computed(() => this.appSettings.ui().nosotrosPage);

  readonly teamMembers = computed(() =>
    this.F().team.members.map((m, i) => ({
      name: m.name,
      role: m.role,
      variant: VARIANTS[i % 4],
      avatarUrl: avatarCartoon(m.name),
    })),
  );

  safe(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  blockNum(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}
