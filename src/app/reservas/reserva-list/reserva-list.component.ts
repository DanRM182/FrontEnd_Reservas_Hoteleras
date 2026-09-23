import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { ReservaResponse } from '../../core/models/reserva.model';
import { mensajeErrorApi } from '../../core/utils/api-error.helper';
import { ReservaService } from '../reserva.service';

@Component({
  selector: 'app-reserva-list',
  standalone: false,
  templateUrl: './reserva-list.component.html',
  styleUrl: './reserva-list.component.scss'
})
export class ReservaListComponent implements OnInit {
  registros: ReservaResponse[] = [];
  columnas = ['id', 'huesped', 'contacto', 'fechaEntrada', 'fechaSalida', 'estadoReserva'];
  cargando = false;
  error = '';

  constructor(private service: ReservaService) {}
  ngOnInit(): void { this.buscar(); }

  buscar(): void {
    if (this.cargando) return;
    this.cargando = true;
    this.error = '';
    this.service.listar().pipe(finalize(() => this.cargando = false)).subscribe({
      next: data => this.registros = data,
      error: error => this.error = mensajeErrorApi(error, 'No se pudieron consultar las reservaciones.')
    });
  }
}
