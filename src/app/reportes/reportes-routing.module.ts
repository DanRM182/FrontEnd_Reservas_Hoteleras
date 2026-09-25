import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReporteComponent } from './reporte/reporte.component';
import { roleGuard } from '../core/guards/rol.guard';
const routes: Routes = [{ path: '', component: ReporteComponent, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN'] } }];
@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class ReportesRoutingModule {}
