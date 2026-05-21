import { HttpErrorResponse } from '@angular/common/http';


export function apiErrorMessage(
  err: HttpErrorResponse,
  fallback: string,
): string {
  if (err.status === 0) {
    return 'No se pudo conectar con el servidor. Comprueba que el backend esté en marcha.';
  }
  const body = err.error as { message?: string | string[] } | null;
  if (body && Array.isArray(body.message)) {
    return body.message.join('. ');
  }
  if (body && typeof body.message === 'string') {
    return body.message;
  }
  return fallback;
}
