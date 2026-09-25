import { HuespedResponse } from './huesped.model';

export interface ReservaRequest {
  idHabitacion: number;
  idHuesped: number;
  fechaEntrada: string;
  fechaSalida: string;
}

export const ESTADOS_RESERVA = [
  { id: 1, descripcion: 'Reservación creada', etiqueta: 'Confirmada' },
  { id: 2, descripcion: 'Check-in realizado', etiqueta: 'En curso' },
  { id: 3, descripcion: 'Check-out realizado', etiqueta: 'Finalizada' },
  { id: 4, descripcion: 'Reserva cancelada', etiqueta: 'Cancelada' }
] as const;
export type EstadoReservaId = typeof ESTADOS_RESERVA[number]['id'];

export interface ReservaResponse {
  id: number;
  huesped: Omit<HuespedResponse, 'id'> | null;
  habitacion: { id: number; numeroHabitacion: string; tipoHabitacion: string } | null;
  estadoReserva: string;
  fechaEntrada: string; // dd/MM/yyyy; no convertir con Date para evitar cambios de zona horaria.
  fechaSalida: string;
}

export function esReservaActiva(reserva: ReservaResponse): boolean {
  return reserva.estadoReserva === 'Reservación creada' || reserva.estadoReserva === 'Check-in realizado';
}

export function estadoReservaId(reserva: ReservaResponse): EstadoReservaId | null {
  return ESTADOS_RESERVA.find(estado => estado.descripcion === reserva.estadoReserva)?.id ?? null;
}

export function puedeTransicionar(reserva: ReservaResponse, destino: EstadoReservaId): boolean {
  const origen = estadoReservaId(reserva);
  return origen === 1 ? destino === 2 || destino === 4 : origen === 2 && destino === 3;
}

export function puedeEditarReserva(reserva: ReservaResponse): boolean {
  return esReservaActiva(reserva);
}

export function puedeEliminarReserva(reserva: ReservaResponse): boolean {
  const estado = estadoReservaId(reserva);
  return estado !== null && estado !== 2;
}

// La API omite idHuesped. Nunca elegir por nombre ni tomar la primera coincidencia.
export function resolverIdHuesped(reserva: ReservaResponse, huespedes: HuespedResponse[]): number | null {
  const datos = reserva.huesped;
  if (!datos) return null;
  const coincidencias = huespedes.filter(h =>
    h.email.trim().toLowerCase() === datos.email.trim().toLowerCase() &&
    h.telefono === datos.telefono && h.documento === datos.documento &&
    h.nombre === datos.nombre && h.nacionalidad === datos.nacionalidad);
  return coincidencias.length === 1 ? coincidencias[0].id : null;
}
