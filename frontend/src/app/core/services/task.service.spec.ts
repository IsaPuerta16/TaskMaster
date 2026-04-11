import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { environment } from '@env/environment';
import type { TaskStatus } from '@core/models';

describe('TaskService', () => {
  let service: TaskService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService],
    });
    service = TestBed.inject(TaskService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getTasks: GET a /tasks sin query si no hay estado', (done) => {
    service.getTasks().subscribe((tasks) => {
      expect(tasks).toEqual([]);
      done();
    });
    const req = http.expectOne(`${environment.apiUrl}/tasks`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush([]);
  });

  it('getTasks: añade query status', (done) => {
    service.getTasks('finalizada' as TaskStatus).subscribe((tasks) => {
      expect(tasks).toEqual([]);
      done();
    });
    const req = http.expectOne(
      (r) =>
        r.url === `${environment.apiUrl}/tasks` &&
        r.params.get('status') === 'finalizada',
    );
    req.flush([]);
  });

  it('createTask: POST con cuerpo', (done) => {
    const dto = {
      title: 'T',
      dueDate: '2026-05-01',
      priority: 'media' as const,
    };
    const created = {
      id: '1',
      ...dto,
      description: null,
      status: 'pendiente',
      userId: 'u',
      createdAt: '',
      updatedAt: '',
    };
    service.createTask(dto).subscribe((t) => {
      expect(t.id).toBe('1');
      done();
    });
    const req = http.expectOne(`${environment.apiUrl}/tasks`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(created);
  });

  it('getStats: GET /tasks/stats', (done) => {
    service.getStats().subscribe((s) => {
      expect(s.total).toBe(3);
      done();
    });
    const req = http.expectOne(`${environment.apiUrl}/tasks/stats`);
    expect(req.request.method).toBe('GET');
    req.flush({
      total: 3,
      completed: 1,
      pending: 2,
      overdue: 0,
      completionRate: 33,
    });
  });
});
