import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { Reporte, ReporteService } from '../reporte.service';
import { mensajeErrorApi } from '../../core/utils/api-error.helper';
@Component({ selector: 'app-reporte', standalone: false, templateUrl: './reporte.component.html', styleUrl: './reporte.component.scss' })
export class ReporteComponent implements OnInit {
  reporte: Reporte | null = null;
  columnas = ['estado', 'total'];
  cargando = false;
  error = '';
  constructor(private service: ReporteService) {}
  ngOnInit(): void { this.cargar(); }
  cargar(): void {
    if (this.cargando) return;
    this.cargando = true;
    this.error = '';
    this.service.obtener().pipe(finalize(() => this.cargando = false)).subscribe({
      next: reporte => this.reporte = reporte,
      error: error => { this.reporte = null; this.error = mensajeErrorApi(error, 'No se pudo cargar el reporte.'); }
    });
  }
}
