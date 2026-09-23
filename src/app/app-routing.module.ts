import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/rol.guard';
import { ROLES } from './core/models/usuario.model';
import { guestGuard } from './core/guards/guest.guard';

const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'reservaciones',
        canActivate: [authGuard],
        loadChildren: () => import('./reservas/reservas.module').then(m => m.ReservasModule)
      },
      {
        path: 'habitaciones',
        canActivate: [authGuard],
        loadChildren: () => import('./habitaciones/habitaciones.module').then(m => m.HabitacionesModule)
      },
      {
        path: 'huespedes',
        canActivate: [authGuard],
        loadChildren: () => import('./huespedes/huespedes.module').then(m => m.HuespedesModule)
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: [ROLES[0]]},
        loadChildren: () => import('./usuarios/usuarios.module').then(m => m.UsuariosModule)
      }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
