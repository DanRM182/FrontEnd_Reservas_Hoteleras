import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { ReservaListComponent } from './reserva-list.component';
import { ReservaService } from '../reserva.service';
import { PermisosService } from '../../core/services/permisos.service';

describe('Errores de operaciones de reserva', () => {
  it('no confirma éxito ni reintenta la liberación cuando el servidor falla', () => {
    const service = jasmine.createSpyObj<ReservaService>('ReservaService', ['actualizarEstado', 'listar']);
    const reserva = { id: 3, huesped: null, habitacion: null, estadoReserva: 'Check-in realizado', fechaEntrada: '24/09/2026', fechaSalida: '26/09/2026' };
    service.actualizarEstado.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    service.listar.and.returnValue(of([reserva]));
    const snack = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    spyOn(window, 'confirm').and.returnValue(true);
    const c = new ReservaListComponent(service, { operar: true, administrar: false } as PermisosService, {} as MatDialog, snack);
    c.registros = [reserva];
    c.cambiarEstado(reserva, 3);
    expect(c.errorOperacion).toContain('No se pudo confirmar');
    expect(c.registros[0].estadoReserva).toBe('Check-in realizado');
    expect(snack.open).not.toHaveBeenCalled();
    c.cambiarEstado(reserva, 3);
    expect(service.actualizarEstado).toHaveBeenCalledTimes(1);
    c.buscar();
    expect(c.errorOperacion).toBe('');
  });
});
