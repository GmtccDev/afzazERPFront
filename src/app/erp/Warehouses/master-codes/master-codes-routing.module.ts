import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WarehousesPeriodsComponent } from './warehouses-periods/warehouses-periods.component';
import { AddEditWarehousesPeriodsComponent } from './warehouses-periods/add-edit-warehouses-periods/add-edit-warehouses-periods.component';
import { WarehousesUnitsComponent } from 'src/app/erp/Warehouses/master-codes/warehouses-units/warehouses-units/warehouses-units.component';
import { AddwarehousesUnitComponent } from 'src/app/erp/Warehouses/master-codes/warehouses-units/add-warehouses-unit/add-warehouses-unit.component';
import { AddEditWarehousesTaxComponent } from 'src/app/erp/Warehouses/master-codes/warehouses-taxes/add-edit-warehouses-tax/add-edit-warehouses-tax.component';
import {WarehousesTaxComponent} from 'src/app/erp/Warehouses/master-codes/warehouses-taxes/warehouses-taxes.component'
const routes: Routes = [
	{
		path: '',
		children: [
		
			{ path: 'warehousesPeriod', component: WarehousesPeriodsComponent },
			{ path: 'warehousesPeriod/add-warehousesPeriod', component: AddEditWarehousesPeriodsComponent },
			{ path: 'warehousesPeriod/update-warehousesPeriod/:id', component: AddEditWarehousesPeriodsComponent },
			{ path: 'warehousesUnit/add-warehousesUnit', component: AddwarehousesUnitComponent },
			{ path: 'warehousesUnit/update-warehousesUnit/:id', component: AddwarehousesUnitComponent },
			{ path: 'warehousesUnit', component: WarehousesUnitsComponent },
			{ path: 'warehousesTax/add-warehousesTax', component: AddEditWarehousesTaxComponent },
			{ path: 'warehousesTax/update-warehousesTax/:id', component: AddEditWarehousesTaxComponent },
			{ path: 'warehousesTax', component: WarehousesTaxComponent },
			
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	
})

export class MasterCodesRoutingModule { }
