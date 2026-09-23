import { HttpErrorResponse } from '@angular/common/http';

export function mensajeErrorApi(error: unknown, mensaje: string): string {
  if (!(error instanceof HttpErrorResponse)) return mensaje;
  // Mantener el detalle del conflicto, incluso si proviene de un servicio remoto.
  if (typeof error.error?.mensaje === 'string' && error.error.mensaje.trim()) {
    return error.error.mensaje;
  }
  if (error.status === 0 || error.status === 502 || error.status === 503 || error.status === 504) {
    return 'No se pudo conectar con el servicio. Intenta nuevamente.';
  }
  if (error.status === 401) return 'Tu sesión ha expirado. Inicia sesión nuevamente.';
  if (error.status === 403) return 'No tienes permisos para realizar esta acción.';
  if (error.status === 409) return 'No se puede realizar la operación por el estado actual o por registros relacionados.';
  if (error.status >= 500) return 'No se pudo completar la operación. El servicio o una de sus dependencias no está disponible. Intenta nuevamente.';
  // El contrato de errores de commons usa "mensaje".
  return mensaje;
}
