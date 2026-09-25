import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReservaService } from './reserva.service';

describe('Contrato HTTP de reservas', () => {
  let service: ReservaService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ReservaService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('registra y actualiza con IDs y fechas dd/MM/yyyy', () => {
    const body = { idHabitacion: 9, idHuesped: 8, fechaEntrada: '24/09/2026', fechaSalida: '26/09/2026' };
    service.registrar(body).subscribe();
    const post = http.expectOne('/api/reservas');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual(body);
    post.flush({ id: 3 });
    service.actualizar(3, body).subscribe();
    const put = http.expectOne('/api/reservas/3');
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual(body);
    put.flush({ id: 3 });
  });
  it('envía check-in, check-out y cancelación solo al servicio de reservas', () => {
    for (const destino of [2, 3, 4] as const) {
      service.actualizarEstado(3, destino).subscribe();
      const req = http.expectOne('/api/reservas/3/estado/' + destino);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toBeNull();
      req.flush({ id: 3 });
    }
  });
});
