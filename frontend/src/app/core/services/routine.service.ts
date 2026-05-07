import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RoutineService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/assistant/routine`;

  generateRoutine() {
    return this.http.post<{ text: string }>(this.apiUrl, {});
  }
}
