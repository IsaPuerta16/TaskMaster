import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import type { User } from '@core/models';

export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  email: string;
  role: 'estudiante' | 'profesional' | 'otro';
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private readonly http: HttpClient) {}

  getMe() {
    return this.http.get<User>(`${environment.apiUrl}/users/me`);
  }

  updateMe(dto: UpdateProfileDto) {
    return this.http.patch<User>(`${environment.apiUrl}/users/me`, dto);
  }
}
