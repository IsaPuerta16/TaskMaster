import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import type { User } from '@core/models';
import { resolveUserAvatarUrl } from '@core/utils/avatar-from-name.util';

@Injectable({ providedIn: 'root' })
export class UserAvatarService {
  private readonly auth = inject(AuthService);

  urlFor(user?: User | null): string {
    return resolveUserAvatarUrl(user ?? this.auth.user());
  }
}
