import type { UserSettingsResponse } from '@features/user-settings/data-access/user-settings.model';

const PREFIX = 'taskmaster_user_snapshot_';

export function cacheUserSettingsSnapshot(
  userId: string,
  snapshot: UserSettingsResponse,
): void {
  try {
    localStorage.setItem(PREFIX + userId, JSON.stringify(snapshot));
  } catch {
    
  }
}

export function readCachedUserSettingsSnapshot(
  userId: string,
): UserSettingsResponse | null {
  try {
    const raw = localStorage.getItem(PREFIX + userId);
    if (!raw) return null;
    return JSON.parse(raw) as UserSettingsResponse;
  } catch {
    return null;
  }
}
