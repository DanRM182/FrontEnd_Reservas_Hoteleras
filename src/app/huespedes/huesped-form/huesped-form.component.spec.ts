import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { throwError } from 'rxjs';
import { HuespedesModule } from '../huespedes.module';
import { HuespedService } from '../huesped.service';
import { HuespedFormComponent } from './huesped-form.component';

describe('Edición de huéspedes con reservas', () => {
  let service: jasmine.SpyObj<HuespedService>;
  const close = jasmine.createSpy('close');

  beforeEach(() => {
    close.calls.reset();
    service = jasmine.createSpyObj('HuespedService', ['actualizar']);
    TestBed.configureTestingModule({
      imports: [HuespedesModule, NoopAnimationsModule],
      providers: [
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
});
