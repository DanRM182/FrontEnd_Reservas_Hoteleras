import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HabitacionRequest, HabitacionResponse, EstadoHabitacionId } from '../core/models/habitacion.model';

@Injectable({ providedIn: 'root' })
export class HabitacionService {
  private readonly baseUrl = `${environment.apiUrl}/api/habitaciones`;

  constructor(private http: HttpClient) {}

  listar(): Observable<HabitacionResponse[]> {
    return this.http.get<HabitacionResponse[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<HabitacionResponse> {
    return this.http.get<HabitacionResponse>(`${this.baseUrl}/${id}`);
  }

  registrar(request: HabitacionRequest): Observable<HabitacionResponse> {
    return this.http.post<HabitacionResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: HabitacionRequest): Observable<HabitacionResponse> {
    return this.http.put<HabitacionResponse>(`${this.baseUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  actualizarEstado(id: number, idEstado: EstadoHabitacionId): Observable<HabitacionResponse> {
    return this.http.patch<HabitacionResponse>(`${this.baseUrl}/${id}/estado/${idEstado}`, null);
  }
}
