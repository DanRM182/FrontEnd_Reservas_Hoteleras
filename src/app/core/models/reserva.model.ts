import { HuespedResponse } from './huesped.model';

export interface ReservaResponse {
  id: number;
  huesped: Omit<HuespedResponse, 'id'> | null;
  // El contrato Java sigue siendo Object y actualmente devuelve null.
  habitacion: unknown;
  estadoReserva: string;
  fechaEntrada: string; // dd/MM/yyyy; no convertir con Date para evitar cambios de zona horaria.
  fechaSalida: string;
}

export function esReservaActiva(reserva: ReservaResponse): boolean {
  return reserva.estadoReserva === 'Reservación creada' || reserva.estadoReserva === 'Check-in realizado';
}
