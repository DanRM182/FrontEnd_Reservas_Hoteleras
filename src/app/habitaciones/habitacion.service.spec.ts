import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HabitacionService } from './habitacion.service';

describe('Contrato HTTP de habitaciones', () => {
  let service: HabitacionService;
  let http: HttpTestingController;
  const request = { numeroHabitacion: '101A', idTipoHabitacion: 2 as const, precio: 1500, capacidad: 2 };
  const response = { id: 5, numeroHabitacion: '101A', tipoHabitacion: 'Habitacion con cama doble', estadoHabitacion: 'Disponible', precio: 1500, capacidad: 2 };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(HabitacionService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('lee las descripciones del backend sin inventar campos', () => {
    service.listar().subscribe(data => expect(data).toEqual([response]));
    const req = http.expectOne('/api/habitaciones');
    expect(req.request.method).toBe('GET');
    req.flush([response]);
  });

  it('crea con idTipoHabitacion numérico', () => {
    service.registrar(request).subscribe();
    const req = http.expectOne('/api/habitaciones');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    expect(req.request.body.tipo).toBeUndefined();
    req.flush(response, { status: 201, statusText: 'Created' });
  });

  it('actualiza por ID y elimina aceptando 204', () => {
    service.actualizar(5, request).subscribe();
    const update = http.expectOne('/api/habitaciones/5');
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual(request);
    update.flush(response);
    service.eliminar(5).subscribe();
    const remove = http.expectOne('/api/habitaciones/5');
    expect(remove.request.method).toBe('DELETE');
    remove.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('cambia estado con código en la URL y sin cuerpo JSON', () => {
    service.actualizarEstado(5, 4).subscribe();
    const req = http.expectOne('/api/habitaciones/5/estado/4');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();
    req.flush({ ...response, estadoHabitacion: 'En mantenimiento' });
  });
});
