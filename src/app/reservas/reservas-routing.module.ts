import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservaListComponent } from './reserva-list/reserva-list.component';

const routes: Routes = [{ path: '', component: ReservaListComponent }];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservasRoutingModule {}
