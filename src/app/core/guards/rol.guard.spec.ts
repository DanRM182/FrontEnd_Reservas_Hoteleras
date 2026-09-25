import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { roleGuard } from './rol.guard';

describe('Guard de roles', () => {
  let auth: jasmine.SpyObj<AuthService>;
  beforeEach(() => {
    auth = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'hasAnyRole', 'logout']);
    TestBed.configureTestingModule({ providers: [
      { provide: AuthService, useValue: auth },
      { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } }
    ] });
  });
  const route = { data: { roles: ['ROLE_ADMIN'] } } as unknown as ActivatedRouteSnapshot;
  it('rechaza el acceso directo a reportes o usuarios de un recepcionista', () => {
    auth.isAuthenticated.and.returnValue(true);
    auth.hasAnyRole.and.returnValue(false);
    expect(TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot))).toBeFalse();
  });
  it('admite ADMIN y rechaza sesión expirada', () => {
    auth.isAuthenticated.and.returnValue(true);
    auth.hasAnyRole.and.returnValue(true);
    expect(TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot))).toBeTrue();
    auth.isAuthenticated.and.returnValue(false);
    expect(TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot))).toBeFalse();
    expect(auth.logout).toHaveBeenCalled();
  });
});
