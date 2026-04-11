import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';

export interface DayNote {
  id: string;
  text: string;
}

export interface CalendarDayNotesResponse {
  dateKey: string;
  notes: DayNote[];
}

@Injectable({ providedIn: 'root' })
export class CalendarNotesService {
  constructor(private readonly http: HttpClient) {}

  getRange(from: string, to: string) {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<CalendarDayNotesResponse[]>(
      `${environment.apiUrl}/calendar-notes`,
      { params },
    );
  }

  saveDate(dateKey: string, notes: DayNote[]) {
    return this.http.put<CalendarDayNotesResponse>(
      `${environment.apiUrl}/calendar-notes/${dateKey}`,
      { dateKey, notes },
    );
  }
}
