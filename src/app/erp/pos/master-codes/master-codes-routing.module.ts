import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PointOfSaleComponent } from './point-of-sale/point-of-sale.component';
import { ShiftsComponent } from './shifts/shifts.component';

const routes: Routes = [
	{ path: 'pointOfSale', component: PointOfSaleComponent },
	{ path: 'shifts', component: ShiftsComponent }

];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MasterCodesRoutingModule { }
