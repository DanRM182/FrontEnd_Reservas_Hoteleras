import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../usuarios/usuario.service';
import { AuthService } from '../core/services/auth.service';
import { ROLES } from '../core/models/usuario.model';
import { HabitacionService } from '../habitaciones/habitacion.service';
import { HuespedService } from '../huespedes/huesped.service';
import { obtenerEstadoHabitacionId } from '../core/models/habitacion.model';
import { ReservaService } from '../reservas/reserva.service';
import { esReservaActiva } from '../core/models/reserva.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  totalUsuarios = 0;
  cargando = true;
  isAdmin = false;
  habitacionesDisponibles: number | null = null;
  totalHuespedes: number | null = null;
  cargandoHabitaciones = true;
  cargandoHuespedes = true;
  errorHabitaciones = false;
  errorHuespedes = false;
  reservasActivas: number | null = null;
  cargandoReservas = true;
  errorReservas = false;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private habitacionService: HabitacionService,
    private huespedService: HuespedService,
    private reservaService: ReservaService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole(ROLES[0]);
    if(this.isAdmin) {
      this.cargarHabitaciones();
      this.cargarHuespedes();
      this.cargarReservas();
      this.listarUsuarios();
    }
  }

  cargarHabitaciones(): void {
    if (!this.authService.isAdmin()) return;
    this.cargandoHabitaciones = true;
    this.errorHabitaciones = false;
    this.habitacionService.listar().subscribe({
      next: data => {
        this.habitacionesDisponibles = data.filter(habitacion => obtenerEstadoHabitacionId(habitacion.estadoHabitacion) === 1).length;
        this.cargandoHabitaciones = false;
      },
      error: () => {
        this.habitacionesDisponibles = null;
        this.errorHabitaciones = true;
        this.cargandoHabitaciones = false;
      }
    });
  }

  cargarReservas(): void {
    if (!this.authService.isAdmin()) return;
    this.cargandoReservas = true;
    this.errorReservas = false;
    this.reservaService.listar().subscribe({
      next: data => {
        this.reservasActivas = data.filter(esReservaActiva).length;
        this.cargandoReservas = false;
      },
      error: () => {
        this.reservasActivas = null;
        this.errorReservas = true;
        this.cargandoReservas = false;
      }
    });
  }

  cargarHuespedes(): void {
    if (!this.authService.isAdmin()) return;
    this.cargandoHuespedes = true;
    this.errorHuespedes = false;
    this.huespedService.listar().subscribe({
      next: data => {
        this.totalHuespedes = data.length;
        this.cargandoHuespedes = false;
      },
      error: () => {
        this.totalHuespedes = null;
        this.errorHuespedes = true;
        this.cargandoHuespedes = false;
      }
    });
  }

  listarUsuarios(): void {
    if (!this.authService.isAdmin()) return;
    this.usuarioService.listar().subscribe({
      next: (data) => {
        this.totalUsuarios = data.length;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }
}
