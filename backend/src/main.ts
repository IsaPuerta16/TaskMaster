import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'https://taskmaster1-one.vercel.app',
      'https://task-master-beta-six.vercel.app',
    ],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
