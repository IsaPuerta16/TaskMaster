import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

/**
 * Pruebas e2e contra la API real configurada en `.env` (DATABASE_URL).
 * Ejecutar: `npm run test:e2e` con backend configurado.
 * No requieren n8n: solo rutas protegidas y validación.
 */
describe('TaskMaster API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/tasks sin JWT → 401', () => {
    return request(app.getHttpServer()).get('/api/tasks').expect(401);
  });

  it('GET /api/assistant/conversations sin JWT → 401', () => {
    return request(app.getHttpServer())
      .get('/api/assistant/conversations')
      .expect(401);
  });

  it('POST /api/auth/register sin body válido → 400', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({})
      .expect(400);
  });
});
