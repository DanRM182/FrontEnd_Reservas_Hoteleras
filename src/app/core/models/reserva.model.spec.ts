import { ReservaResponse, puedeTransicionar, puedeEditarReserva, puedeEliminarReserva, resolverIdHuesped } from './reserva.model';
import { HuespedResponse } from './huesped.model';
import { errorFechas, fechaApiAInput, fechaInputAApi } from '../utils/fecha.helper';

describe('Reglas de reservas y fechas', () => {
  const huesped: HuespedResponse = { id: 8, nombre: 'Ana Del Río López', email: 'ana@example.com', telefono: '0123456789', documento: 'A8', nacionalidad: 'Mexicana' };
  const base: ReservaResponse = { id: 3, huesped, habitacion: { id: 9, numeroHabitacion: '101A', tipoHabitacion: 'Habitacion estandar' }, estadoReserva: 'Reservación creada', fechaEntrada: '24/09/2026', fechaSalida: '26/09/2026' };
  it('permite únicamente las transiciones del backend', () => {
    expect(puedeTransicionar(base, 2)).toBeTrue();
    expect(puedeTransicionar(base, 4)).toBeTrue();
    expect(puedeTransicionar(base, 3)).toBeFalse();
    const enCurso = { ...base, estadoReserva: 'Check-in realizado' };
    expect(puedeTransicionar(enCurso, 3)).toBeTrue();
    expect(puedeTransicionar(enCurso, 4)).toBeFalse();
    expect(puedeEliminarReserva(enCurso)).toBeFalse();
    for (const estadoReserva of ['Check-out realizado', 'Reserva cancelada']) {
      const final = { ...base, estadoReserva };
      expect(puedeEditarReserva(final)).toBeFalse();
      expect(puedeTransicionar(final, 2)).toBeFalse();
    }
  });
  it('rechaza fechas inválidas, invertidas y entradas pasadas para reservas confirmadas', () => {
    expect(errorFechas('2026-09-24', '2026-09-24', false, '2026-09-24')).toBeTruthy();
    expect(errorFechas('2026-02-30', '2026-10-01', false, '2026-09-24')).toBeTruthy();
    expect(errorFechas('2026-09-23', '2026-09-26', false, '2026-09-24')).toBeTruthy();
    expect(errorFechas('2026-09-23', '2026-09-26', true, '2026-09-24')).toBe('');
  });
  it('preserva el día sin conversiones UTC', () => {
    expect(fechaApiAInput('01/10/2026')).toBe('2026-10-01');
    expect(fechaInputAApi('2026-10-01')).toBe('01/10/2026');
  });
  it('solo identifica huéspedes de forma inequívoca, nunca por nombre', () => {
    expect(resolverIdHuesped(base, [huesped])).toBe(8);
    expect(resolverIdHuesped(base, [huesped, { ...huesped, id: 99 }])).toBeNull();
    expect(resolverIdHuesped(base, [{ ...huesped, documento: 'OTRO' }])).toBeNull();
    expect(resolverIdHuesped(base, [])).toBeNull();
  });
});
