import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { UsuarioRequest, UsuarioResponse } from '../core/models/usuario.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly baseUrl = `${environment.authUrl}/admin/usuarios`;

  constructor(private http: HttpClient) { }

  listar(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(this.baseUrl);
  }

  registrar(request: UsuarioRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.baseUrl, request);
  }

  eliminar(username: string): Observable<UsuarioResponse> {
    return this.http.delete<UsuarioResponse>(`${this.baseUrl}/${encodeURIComponent(username)}`);
  }
}
