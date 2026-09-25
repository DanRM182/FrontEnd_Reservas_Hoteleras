import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReservaResponse, ReservaRequest, EstadoReservaId } from '../core/models/reserva.model';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly baseUrl = `${environment.apiUrl}/api/reservas`;
  constructor(private http: HttpClient) {}

  listar(): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<ReservaResponse> {
    return this.http.get<ReservaResponse>(`${this.baseUrl}/${id}`);
  }

  registrar(request: ReservaRequest): Observable<ReservaResponse> {
    return this.http.post<ReservaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ReservaRequest): Observable<ReservaResponse> {
    return this.http.put<ReservaResponse>(`${this.baseUrl}/${id}`, request);
  }

  actualizarEstado(id: number, idEstado: EstadoReservaId): Observable<ReservaResponse> {
    return this.http.patch<ReservaResponse>(`${this.baseUrl}/${id}/estado/${idEstado}`, null);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
