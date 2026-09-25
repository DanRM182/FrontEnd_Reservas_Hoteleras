import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { HuespedesModule } from '../huespedes.module';
import { HuespedService } from '../huesped.service';
import { HuespedFormComponent } from './huesped-form.component';
import { PermisosService } from '../../core/services/permisos.service';

describe('Edición de huéspedes con reservas', () => {
  let service: jasmine.SpyObj<HuespedService>;
  const close = jasmine.createSpy('close');

  beforeEach(() => {
    close.calls.reset();
    service = jasmine.createSpyObj('HuespedService', ['actualizar', 'registrar']);
    TestBed.configureTestingModule({
      imports: [HuespedesModule, NoopAnimationsModule],
      providers: [
        { provide: PermisosService, useValue: { operar: true, administrar: true } },
        { provide: HuespedService, useValue: service },
        { provide: MAT_DIALOG_DATA, useValue: { id: 7, nombre: 'María de la Luz Del Río Pérez', email: 'maria@example.com', telefono: '0123456789', documento: 'ABC123', nacionalidad: 'Mexicana' } },
        { provide: MatDialogRef, useValue: { close, disableClose: false } },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } }
      ]
    });
  });

  it('no adivina apellidos compuestos ni envía datos sin confirmación', () => {
    const fixture = TestBed.createComponent(HuespedFormComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component.form.value.nombre).toBe('');
    expect(component.form.value.apellidoPaterno).toBe('');
    component.guardar();
    expect(service.actualizar).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('María de la Luz Del Río Pérez');
  });

  it('conserva el formulario y muestra el conflicto de reservas en curso', () => {
    service.actualizar.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 409, error: { codigo: 409, mensaje: 'El huésped tiene reservas en curso' }
    })));
    const component = TestBed.createComponent(HuespedFormComponent).componentInstance;
    component.form.patchValue({ nombre: 'María de la Luz', apellidoPaterno: 'Del Río', apellidoMaterno: 'Pérez' });
    component.guardar();
    expect(component.error).toBe('El huésped tiene reservas en curso');
    expect(component.guardando).toBeFalse();
    expect(component.form.value.telefono).toBe('0123456789');
    expect(close).not.toHaveBeenCalled();
  });

  const nombres = { nombre: 'Maria', apellidoPaterno: 'Flores', apellidoMaterno: 'Perez' };

  it('conserva un documento anterior cuando no se solicita reemplazarlo', () => {
    service.actualizar.and.returnValue(of({} as any));
    const component = TestBed.createComponent(HuespedFormComponent).componentInstance;
    component.form.patchValue(nombres);
    component.guardar();
    expect(service.actualizar.calls.mostRecent().args[1].documento).toBe('ABC123');
  });

  it('envía un solo string con tipo, mayúsculas y ceros iniciales', () => {
    service.actualizar.and.returnValue(of({} as any));
    const component = TestBed.createComponent(HuespedFormComponent).componentInstance;
    component.form.patchValue({ ...nombres, tipoDocumento: 'INE', numeroDocumento: ' 001abc ' });
    component.guardar();
    const request = service.actualizar.calls.mostRecent().args[1];
    expect(request.documento).toBe('INE:001ABC');
    expect(Object.keys(request)).not.toContain('tipoDocumento');
    expect(Object.keys(request)).not.toContain('numeroDocumento');
  });

  it('revalida el límite completo al cambiar de INE a pasaporte y nunca trunca', () => {
    const component = TestBed.createComponent(HuespedFormComponent).componentInstance;
    component.form.patchValue({ ...nombres, tipoDocumento: 'INE', numeroDocumento: '1234567890123456' });
    expect(component.form.valid).toBeTrue();
    component.form.patchValue({ tipoDocumento: 'PASAPORTE' });
    component.guardar();
    expect(component.form.invalid).toBeTrue();
    expect(component.form.value.numeroDocumento).toBe('1234567890123456');
    expect(service.actualizar).not.toHaveBeenCalled();
  });

  it('recupera el tipo y el identificador de un documento guardado con el formato nuevo', () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: {
      id: 7, nombre: 'Maria Flores Perez', email: 'maria@example.com', telefono: '0123456789',
      documento: 'PASAPORTE:001ABC', nacionalidad: 'Extranjera'
    } });
    const component = TestBed.createComponent(HuespedFormComponent).componentInstance;
    expect(component.form.value.tipoDocumento).toBe('PASAPORTE');
    expect(component.form.value.numeroDocumento).toBe('001ABC');
    expect(component.documentoAnterior).toBe('');
  });

  it('exige tipo e identificador en altas y muestra el campo al seleccionar el tipo', () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: null });
    service.registrar.and.returnValue(of({} as any));
    const fixture = TestBed.createComponent(HuespedFormComponent);
    const component = fixture.componentInstance;
    component.form.patchValue({ ...nombres, email: 'maria@example.com', telefono: '0123456789', nacionalidad: 'Extranjera' });
    component.guardar();
    expect(service.registrar).not.toHaveBeenCalled();
    component.form.patchValue({ tipoDocumento: 'PASAPORTE' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[formControlName="numeroDocumento"]')).not.toBeNull();
    component.guardar();
    expect(service.registrar).not.toHaveBeenCalled();
    component.form.patchValue({ numeroDocumento: 'ABC 123' });
    component.guardar();
    expect(service.registrar).not.toHaveBeenCalled();
    component.form.patchValue({ numeroDocumento: '001abc' });
    component.guardar();
    expect(service.registrar.calls.mostRecent().args[0].documento).toBe('PASAPORTE:001ABC');
  });
});
