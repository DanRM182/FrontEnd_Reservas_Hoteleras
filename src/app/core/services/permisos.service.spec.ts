import { PermisosService } from './permisos.service';
import { AuthService } from './auth.service';

describe('Permisos de recepción y gerencia', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let service: PermisosService;
  beforeEach(() => {
    auth = jasmine.createSpyObj('AuthService', ['isAdmin', 'hasAnyRole']);
    auth.isAdmin.and.returnValue(false);
    auth.hasAnyRole.and.returnValue(true);
    service = new PermisosService(auth);
  });
  it('USER consulta habitaciones pero no modifica precios, estado ni registros', () => {
    expect(service.permiteSolicitud('/api/habitaciones', 'GET')).toBeTrue();
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      expect(service.permiteSolicitud('/api/habitaciones/1', method)).toBeFalse();
    }
  });
  it('USER crea huéspedes y opera reservas sin eliminar', () => {
    expect(service.permiteSolicitud('/api/huespedes', 'POST')).toBeTrue();
    expect(service.permiteSolicitud('/api/huespedes/1', 'PUT')).toBeFalse();
    expect(service.permiteSolicitud('/api/reservas', 'POST')).toBeTrue();
    expect(service.permiteSolicitud('/api/reservas/1', 'PUT')).toBeTrue();
    expect(service.permiteSolicitud('/api/reservas/1/estado/2', 'PATCH')).toBeTrue();
    expect(service.permiteSolicitud('/api/reservas/1', 'DELETE')).toBeFalse();
    expect(service.permiteSolicitud('/auth-api/admin/usuarios', 'POST')).toBeFalse();
  });
  it('ADMIN puede administrar todos los módulos', () => {
    auth.isAdmin.and.returnValue(true);
    expect(service.permiteSolicitud('/api/habitaciones/1', 'PUT')).toBeTrue();
    expect(service.permiteSolicitud('/api/reservas/1', 'DELETE')).toBeTrue();
    expect(service.permiteSolicitud('/auth-api/admin/usuarios', 'POST')).toBeTrue();
  });
  it('sin rol operativo no permite consultar datos del hotel', () => {
    auth.hasAnyRole.and.returnValue(false);
    expect(service.permiteSolicitud('/api/reservas', 'GET')).toBeFalse();
  });
});
