import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  private readonly log = new Logger(TypeOrmExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const driverError = exception.driverError as { code?: string; detail?: string; message?: string };

    this.log.error(
      `QueryFailedError [${driverError?.code ?? 'unknown'}]: ${driverError?.message ?? exception.message}`,
      driverError?.detail ?? '',
    );

    const isDev = (process.env.NODE_ENV ?? 'development') !== 'production';
    const hint =
      driverError?.code === '42703'
        ? 'Falta una columna en la base de datos. Ejecuta: node scripts/ensure-task-columns.js'
        : undefined;

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: 500,
      message: isDev
        ? driverError?.message ?? 'Error de base de datos'
        : 'Internal server error',
      ...(isDev && hint ? { hint } : {}),
    });
  }
}
