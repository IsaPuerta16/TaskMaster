import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { Task, TaskPriority, TaskStatus } from '../entities/task.entity';

describe('TaskService (estadísticas y reglas)', () => {
  let service: TaskService;
  const mockRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: getRepositoryToken(Task), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(TaskService);
  });

  it('getStats: sin tareas devuelve ceros y lista de insights', async () => {
    mockRepo.find.mockResolvedValue([]);
    const stats = await service.getStats('user-1');
    expect(stats.total).toBe(0);
    expect(stats.completed).toBe(0);
    expect(stats.pending).toBe(0);
    expect(stats.overdue).toBe(0);
    expect(stats.completionRate).toBe(0);
    expect(stats.streakDays).toBe(0);
    expect(Array.isArray(stats.insights)).toBe(true);
    expect(stats.insights!.length).toBeGreaterThan(0);
  });

  it('getStats: cuenta finalizadas y pendientes', async () => {
    const tasks: Partial<Task>[] = [
      {
        id: '1',
        userId: 'u',
        status: TaskStatus.FINALIZADA,
        dueDate: new Date(Date.now() + 86400000),
        priority: TaskPriority.MEDIA,
        updatedAt: new Date(),
      },
      {
        id: '2',
        userId: 'u',
        status: TaskStatus.PENDIENTE,
        dueDate: new Date(Date.now() + 86400000),
        priority: TaskPriority.MEDIA,
        updatedAt: new Date(),
      },
    ];
    mockRepo.find.mockResolvedValue(tasks);
    const stats = await service.getStats('u');
    expect(stats.total).toBe(2);
    expect(stats.completed).toBe(1);
    expect(stats.pending).toBe(1);
    expect(stats.completionRate).toBe(50);
  });
});
