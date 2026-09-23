import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HuespedRequest, HuespedResponse } from '../core/models/huesped.model';

@Injectable({ providedIn: 'root' })
export class HuespedService {
  private readonly baseUrl = `${environment.apiUrl}/api/huespedes`;

  constructor(private http: HttpClient) {}

  listar(): Observable<HuespedResponse[]> {
    return this.http.get<HuespedResponse[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<HuespedResponse> {
    return this.http.get<HuespedResponse>(`${this.baseUrl}/${id}`);
  }

  registrar(request: HuespedRequest): Observable<HuespedResponse> {
    return this.http.post<HuespedResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: HuespedRequest): Observable<HuespedResponse> {
    return this.http.put<HuespedResponse>(`${this.baseUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
