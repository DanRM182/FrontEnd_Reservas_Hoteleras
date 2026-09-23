import { HabitacionResponse, obtenerTipoHabitacionId, obtenerEstadoHabitacionId, puedeCambiarEstado, estaOcupada } from './habitacion.model';

describe('Catálogos y reglas de habitaciones', () => {
  const habitacion: HabitacionResponse = {
    id: 1, numeroHabitacion: '101', tipoHabitacion: 'Habitacion estandar',
    estadoHabitacion: 'Disponible', precio: 100, capacidad: 1
  };

  it('traduce las descripciones exactas a sus códigos', () => {
    expect(obtenerTipoHabitacionId('Habitacion con cama doble')).toBe(2);
    expect(obtenerTipoHabitacionId('Habitacion de tamaño deluxe')).toBe(3);
    expect(obtenerEstadoHabitacionId('Ocupado')).toBe(2);
    expect(obtenerEstadoHabitacionId('En limpieza')).toBe(3);
    expect(obtenerTipoHabitacionId('Tipo desconocido')).toBeNull();
  });

  it('no permite ocupación manual ni cambios al mismo estado', () => {
    expect(puedeCambiarEstado(habitacion, 2)).toBeFalse();
    expect(puedeCambiarEstado(habitacion, 1)).toBeFalse();
    expect(puedeCambiarEstado(habitacion, null)).toBeFalse();
    expect(puedeCambiarEstado(habitacion, 4)).toBeTrue();
  });

  it('respeta la restricción de ocupada a disponible', () => {
    const ocupada = { ...habitacion, estadoHabitacion: 'Ocupado' };
    expect(estaOcupada(ocupada)).toBeTrue();
    expect(puedeCambiarEstado(ocupada, 1)).toBeFalse();
    expect(puedeCambiarEstado(ocupada, 3)).toBeTrue();
    expect(puedeCambiarEstado(ocupada, 4)).toBeTrue();
  });

  it('no cambia estados que no conoce', () => {
    expect(puedeCambiarEstado({ ...habitacion, estadoHabitacion: 'Desconocido' }, 1)).toBeFalse();
  });
});
