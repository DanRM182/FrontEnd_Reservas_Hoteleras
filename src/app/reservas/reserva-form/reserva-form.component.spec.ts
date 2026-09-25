import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ReservasModule } from '../reservas.module';
import { ReservaService } from '../reserva.service';
import { ReservaFormComponent } from './reserva-form.component';
import { HabitacionService } from '../../habitaciones/habitacion.service';
import { HuespedService } from '../../huespedes/huesped.service';
import { PermisosService } from '../../core/services/permisos.service';

describe('Formulario de reservas', () => {
  const huesped = { id: 8, nombre: 'Ana Pérez López', email: 'ana@example.com', telefono: '1234567890', documento: 'A8', nacionalidad: 'Mexicana' };
  const habitacion = { id: 9, numeroHabitacion: '101', tipoHabitacion: 'Habitacion estandar', estadoHabitacion: 'Disponible', precio: 100, capacidad: 1 };
  const reserva = { id: 3, huesped, habitacion, estadoReserva: 'Check-in realizado', fechaEntrada: '01/01/2020', fechaSalida: '31/12/2099' };
  let service: jasmine.SpyObj<ReservaService>;
  beforeEach(() => {
    service = jasmine.createSpyObj('ReservaService', ['obtenerPorId', 'registrar', 'actualizar']);
    service.obtenerPorId.and.returnValue(of(reserva));
    service.registrar.and.returnValue(of(reserva));
    service.actualizar.and.returnValue(of(reserva));
    TestBed.configureTestingModule({
      imports: [ReservasModule, NoopAnimationsModule],
      providers: [
        { provide: ReservaService, useValue: service },
        { provide: HabitacionService, useValue: { listar: () => of([habitacion, { ...habitacion, id: 10, estadoHabitacion: 'Ocupado' }]) } },
        { provide: HuespedService, useValue: { listar: () => of([huesped]) } },
        { provide: PermisosService, useValue: { operar: true, administrar: false } },
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close'), disableClose: false } },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } }
      ]
    });
  });
  it('solo ofrece habitaciones disponibles y registra con el contrato del backend', () => {
    const fixture = TestBed.createComponent(ReservaFormComponent);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    expect(c.habitaciones.length).toBe(1);
    c.form.patchValue({ idHabitacion: 9, idHuesped: 8, fechaEntrada: '2099-12-01', fechaSalida: '2099-12-02' });
    c.guardar();
    expect(service.registrar).toHaveBeenCalledWith({ idHabitacion: 9, idHuesped: 8, fechaEntrada: '01/12/2099', fechaSalida: '02/12/2099' });
  });
  it('en curso permite salida futura aunque entrada sea pasada y bloquea los IDs', () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: reserva });
    const fixture = TestBed.createComponent(ReservaFormComponent);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    expect(c.form.get('fechaEntrada')?.disabled).toBeTrue();
    expect(c.form.get('idHuesped')?.disabled).toBeTrue();
    c.form.patchValue({ fechaSalida: '2099-12-30' });
    c.guardar();
    expect(service.actualizar).toHaveBeenCalledWith(3, { idHabitacion: 9, idHuesped: 8, fechaEntrada: '01/01/2020', fechaSalida: '30/12/2099' });
  });
  it('no envía modificaciones si el huésped no se identifica inequívocamente', () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: reserva });
    TestBed.overrideProvider(HuespedService, { useValue: { listar: () => of([]) } });
    const c = TestBed.createComponent(ReservaFormComponent).componentInstance;
    c.guardar();
    expect(c.bloqueo).toBeTruthy();
    expect(service.actualizar).not.toHaveBeenCalled();
  });
});
