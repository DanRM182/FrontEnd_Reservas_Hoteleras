import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../core/services/theme.services';
import { AuthService } from '../core/services/auth.service';
import { ROLES } from '../core/models/usuario.model';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  disponible: boolean;
}

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {

  sidenavAbierto = true;
  isAdmin = false;
  username: string | null = null;

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', disponible: true },
    { label: 'Reservaciones', icon: 'calendar_month', route: '/reservaciones', disponible: true },
    { label: 'Habitaciones', icon: 'bed', route: '/habitaciones', disponible: true },
    { label: 'Huéspedes', icon: 'people', route: '/huespedes', disponible: true },
    { label: 'Usuarios', icon: 'manage_accounts', route: '/usuarios', disponible: true }
  ];

  constructor(
    public themeService: ThemeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole(ROLES[0]);
    this.username = this.authService.getUsername();
  }

  toggleSidenav(): void {
    this.sidenavAbierto = !this.sidenavAbierto;
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
