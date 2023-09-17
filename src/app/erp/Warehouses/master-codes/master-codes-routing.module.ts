import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WarehousesPeriodsComponent } from './warehouses-periods/warehouses-periods.component';
import { AddEditWarehousesPeriodsComponent } from './warehouses-periods/add-edit-warehouses-periods/add-edit-warehouses-periods.component';
const routes: Routes = [
	{
		path: '',
		children: [
		
			{ path: 'warehousesPeriod', component: WarehousesPeriodsComponent },
			{ path: 'warehousesPeriod/add-warehousesPeriod', component: AddEditWarehousesPeriodsComponent },
			{ path: 'warehousesPeriod/update-warehousesPeriod/:id', component: AddEditWarehousesPeriodsComponent },
			
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	
})

export class MasterCodesRoutingModule { }
