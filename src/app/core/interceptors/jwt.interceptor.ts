import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { PermisosService } from '../services/permisos.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private permisos: PermisosService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const apiPropia = request.url.startsWith('/api/') || request.url.startsWith('/auth-api/');
    const esLogin = request.url === '/auth-api/api/login';
    if (apiPropia && !esLogin && !this.authService.isAuthenticated()) {
      this.authService.logout();
      return throwError(() => new HttpErrorResponse({ status: 401, error: { mensaje: 'Tu sesión ha expirado. Inicia sesión nuevamente.' } }));
    }
    if (!this.permisos.permiteSolicitud(request.url, request.method)) {
      this.snackBar.open('No tienes permisos para realizar esta acción.', 'Cerrar', { duration: 3000 });
      return throwError(() => new HttpErrorResponse({ status: 403, error: { mensaje: 'No tienes permisos para realizar esta acción.' } }));
    }
    const token = this.authService.getToken();

    if (apiPropia && token && !request.url.includes('/api/login') && this.authService.isAuthenticated()) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {

        if (request.url.includes('/api/login')) {
          return throwError(() => error);
        }

        if (error.status === 401) {
          this.authService.logout();
          this.snackBar.open('Sesión expirada o no autorizada. Inicia sesión nuevamente.', 'Cerrar', { duration: 3500 });
        } else if (error.status === 403) {
          this.snackBar.open('No cuentas con permisos para realizar esta acción.', 'Cerrar', { duration: 3000 });
        }

        return throwError(() => error);
      })
    );
  }
}
