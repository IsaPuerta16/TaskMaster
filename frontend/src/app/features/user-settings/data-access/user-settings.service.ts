import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import type {
  UpdateUserSettingsDto,
  UserSettingsResponse,
} from './user-settings.model';

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  constructor(private readonly http: HttpClient) {}

  getSettings() {
    return this.http.get<UserSettingsResponse>(`${environment.apiUrl}/settings`);
  }

  patchSettings(dto: UpdateUserSettingsDto) {
    return this.http.patch<UserSettingsResponse>(`${environment.apiUrl}/settings`, dto);
  }
}
