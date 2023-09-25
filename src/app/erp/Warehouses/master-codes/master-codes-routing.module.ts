import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WarehousesPeriodsComponent } from './warehouses-periods/warehouses-periods.component';
import { AddEditWarehousesPeriodsComponent } from './warehouses-periods/add-edit-warehouses-periods/add-edit-warehouses-periods.component';
import { WarehousesUnitsComponent } from 'src/app/erp/Warehouses/master-codes/warehouses-units/warehouses-units/warehouses-units.component';
import { AddwarehousesUnitComponent } from 'src/app/erp/Warehouses/master-codes/warehouses-units/add-warehouses-unit/add-warehouses-unit.component';
import { AddEditWarehousesTaxComponent } from 'src/app/erp/Warehouses/master-codes/warehouses-taxes/add-edit-warehouses-tax/add-edit-warehouses-tax.component';
import {WarehousesTaxComponent} from 'src/app/erp/Warehouses/master-codes/warehouses-taxes/warehouses-taxes.component'
import { AddEditStoreCardComponent } from './store-card/add-edit-store-card/add-edit-store-card.component';
import { StoreCardComponent } from './store-card/store-card.component';
import { WarehousesPaymentMethodsComponent } from './warehouses-payment-methods/warehouses-payment-methods.component';
import { AddEditWarehousesPaymentMethodsComponent } from './warehouses-payment-methods/add-edit-warehouses-payment-methods/add-edit-warehouses-payment-methods.component';
import { WarehousesCustomersComponent } from './warehouses-customers/warehouses-customers.component';
import { AddEditWarehousesCustomersComponent } from './warehouses-customers/add-edit-warehouses-customers/add-edit-warehouses-customers.component';
import { WarehousesSuppliersComponent } from './warehouses-suppliers/warehouses-suppliers.component';
import { AddEditWarehousesSuppliersComponent } from './warehouses-suppliers/add-edit-warehouses-suppliers/add-edit-warehouses-suppliers.component';
import { ItemCardComponent } from './item-card/item-card.component';
import { AddEditItemCardComponent } from './item-card/add-edit-item-card/add-edit-item-card.component';
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
			{ path: 'storeCard/add-storeCard', component: AddEditStoreCardComponent },
			{ path: 'storeCard/update-storeCard/:id', component: AddEditStoreCardComponent },
			{ path: 'storeCard', component: StoreCardComponent},
			{ path: 'storeCard/add-storeCard/:parentId', component: AddEditStoreCardComponent },
			{ path: 'warehousesPaymentMethod', component: WarehousesPaymentMethodsComponent },
			{ path: 'warehousesPaymentMethod/add-warehousesPaymentMethod', component: AddEditWarehousesPaymentMethodsComponent },
			{ path: 'warehousesPaymentMethod/update-warehousesPaymentMethod/:id', component: AddEditWarehousesPaymentMethodsComponent },
			{ path: 'warehousesCustomer', component: WarehousesCustomersComponent },
			{ path: 'warehousesCustomer/add-warehousesCustomer', component: AddEditWarehousesCustomersComponent },
			{ path: 'warehousesCustomer/update-warehousesCustomer/:id', component: AddEditWarehousesCustomersComponent },
			{ path: 'warehousesSupplier', component: WarehousesSuppliersComponent },
			{ path: 'warehousesSupplier/add-warehousesSupplier', component: AddEditWarehousesSuppliersComponent },
			{ path: 'warehousesSupplier/update-warehousesSupplier/:id', component: AddEditWarehousesSuppliersComponent },
			{ path: 'itemCard', component: ItemCardComponent },
			{ path: 'itemCard/add-itemCard', component: AddEditItemCardComponent },
			{ path: 'itemCard/update-itemCard/:id', component: AddEditItemCardComponent },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	
})

export class MasterCodesRoutingModule { }
