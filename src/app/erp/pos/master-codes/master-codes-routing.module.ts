import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PointOfSaleComponent } from './point-of-sale/point-of-sale.component';
import { ShiftsComponent } from './shifts/shifts.component';
import { FloorsComponent } from './floors/floors.component';

const routes: Routes = [
	{
		path: '',
		children: [
			{ path: 'pointOfSale', component: PointOfSaleComponent },
			{ path: 'shifts', component: ShiftsComponent },
			{ path: 'floors', component: FloorsComponent }
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MasterCodesRoutingModule { }
