import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { HabitacionesModule } from '../habitaciones.module';
import { HabitacionService } from '../habitacion.service';
import { HabitacionFormComponent } from './habitacion-form.component';

describe('Formulario de habitaciones', () => {
  const data = { id: 5, numeroHabitacion: '101A', tipoHabitacion: 'Habitacion con cama doble', estadoHabitacion: 'Disponible', precio: 1500, capacidad: 2 };
  let service: jasmine.SpyObj<HabitacionService>;

  beforeEach(() => {
    service = jasmine.createSpyObj('HabitacionService', ['actualizar', 'registrar']);
    service.actualizar.and.returnValue(of(data));
    TestBed.configureTestingModule({
      imports: [HabitacionesModule, NoopAnimationsModule],
      providers: [
        { provide: HabitacionService, useValue: service },
        { provide: MAT_DIALOG_DATA, useValue: { ...data } },
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close'), disableClose: false } },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } }
      ]
    });
  });

  it('precarga el tipo numérico y guarda únicamente el contrato nuevo', () => {
    const fixture = TestBed.createComponent(HabitacionFormComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.form.value.idTipoHabitacion).toBe(2);
    fixture.componentInstance.guardar();
    expect(service.actualizar).toHaveBeenCalledWith(5, {
      numeroHabitacion: '101A', idTipoHabitacion: 2, precio: 1500, capacidad: 2
    });
  });

  it('rechaza precios con más de dos decimales y capacidades fraccionarias', () => {
    const component = TestBed.createComponent(HabitacionFormComponent).componentInstance;
    component.form.patchValue({ precio: 1.234, capacidad: 1.5 });
    component.guardar();
    expect(component.form.invalid).toBeTrue();
    expect(service.actualizar).not.toHaveBeenCalled();
  });

  it('impide editar habitaciones ocupadas incluso invocando guardar directamente', () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: { ...data, estadoHabitacion: 'Ocupado' } });
    const component = TestBed.createComponent(HabitacionFormComponent).componentInstance;
    component.guardar();
    expect(service.actualizar).not.toHaveBeenCalled();
    expect(component.error).toContain('ocupada');
  });
});
