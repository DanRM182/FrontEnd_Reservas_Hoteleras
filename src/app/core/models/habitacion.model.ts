// Descripciones exactas devueltas por los enums del backend.
export const TIPOS_HABITACION = [
  { id: 1, descripcion: 'Habitacion estandar', etiqueta: 'Individual' },
  { id: 2, descripcion: 'Habitacion con cama doble', etiqueta: 'Doble' },
  { id: 3, descripcion: 'Habitacion de tamaño deluxe', etiqueta: 'Suite' }
] as const;
export type TipoHabitacionId = typeof TIPOS_HABITACION[number]['id'];
export const ESTADOS_HABITACION = [
  { id: 1, descripcion: 'Disponible' },
  { id: 2, descripcion: 'Ocupado' },
  { id: 3, descripcion: 'En limpieza' },
  { id: 4, descripcion: 'En mantenimiento' }
] as const;
export type EstadoHabitacionId = typeof ESTADOS_HABITACION[number]['id'];

export interface HabitacionRequest {
  numeroHabitacion: string;
  idTipoHabitacion: TipoHabitacionId;
  precio: number;
  capacidad: number;
}

export interface HabitacionResponse {
  id: number;
  numeroHabitacion: string;
  tipoHabitacion: string;
  estadoHabitacion: string;
  precio: number;
  capacidad: number;
}

export function obtenerTipoHabitacionId(descripcion: string): TipoHabitacionId | null {
  return TIPOS_HABITACION.find(tipo => tipo.descripcion === descripcion)?.id ?? null;
}

export function obtenerEstadoHabitacionId(descripcion: string): EstadoHabitacionId | null {
  return ESTADOS_HABITACION.find(estado => estado.descripcion === descripcion)?.id ?? null;
}

export function estaOcupada(habitacion: HabitacionResponse): boolean {
  return obtenerEstadoHabitacionId(habitacion.estadoHabitacion) === 2;
}

export function puedeCambiarEstado(habitacion: HabitacionResponse, destino: EstadoHabitacionId | null): boolean {
  const origen = obtenerEstadoHabitacionId(habitacion.estadoHabitacion);
  return origen !== null && destino !== null &&
    ESTADOS_HABITACION.some(estado => estado.id === destino) &&
    destino !== origen && destino !== 2 && origen !== 2;
}
