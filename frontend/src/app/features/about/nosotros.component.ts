import { Component, computed, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FooterComponent } from '@shared/layout';
import { AppSettingsService } from '@core/services/app-settings.service';
import { avatarUrlFromName } from '@core/utils/avatar-from-name.util';

const VARIANTS = ['a', 'b', 'c', 'd'] as const;

export interface TeamMemberView {
  name: string;
  role: string;
  imageUrl: string;
  variant: (typeof VARIANTS)[number];
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
      imageUrl: avatarUrlFromName(m.name, m.name),
      variant: VARIANTS[i % 4],
    })),
  );

  safe(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  blockNum(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}
