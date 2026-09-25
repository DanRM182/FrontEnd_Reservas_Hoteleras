import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { ReportesRoutingModule } from './reportes-routing.module';
import { ReporteComponent } from './reporte/reporte.component';
@NgModule({ declarations: [ReporteComponent], imports: [CommonModule, MaterialModule, ReportesRoutingModule] })
export class ReportesModule {}
