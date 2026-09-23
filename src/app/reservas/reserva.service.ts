import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReservaResponse } from '../core/models/reserva.model';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly baseUrl = `${environment.apiUrl}/api/reservas`;
  constructor(private http: HttpClient) {}

  listar(): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(this.baseUrl);
  }
}
