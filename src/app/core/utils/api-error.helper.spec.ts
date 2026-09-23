import { HttpErrorResponse } from '@angular/common/http';
import { mensajeErrorApi } from './api-error.helper';

describe('Errores de las API del hotel', () => {
  it('conserva el mensaje de negocio en un conflicto', () => {
    const error = new HttpErrorResponse({ status: 409, error: { mensaje: 'El huésped tiene reservas en curso' } });
    expect(mensajeErrorApi(error, 'Error al guardar')).toBe('El huésped tiene reservas en curso');
  });
  it('distingue fallos de dependencias de validaciones del formulario', () => {
    expect(mensajeErrorApi(new HttpErrorResponse({ status: 500 }), 'Revisa tus datos')).toContain('dependencias');
    expect(mensajeErrorApi(new HttpErrorResponse({ status: 503 }), 'Revisa tus datos')).toContain('conectar');
  });
});
