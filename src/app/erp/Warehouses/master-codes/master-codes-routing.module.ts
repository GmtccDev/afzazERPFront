import { SalesPersonCommissionCardComponent } from './sales-person-commission-card/sales-person-commission-card.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PeriodComponent } from './period/period.component';
import { AddEditPeriodComponent } from './period/add-edit-period/add-edit-period.component';
import { UnitComponent } from 'src/app/erp/Warehouses/master-codes/unit/unit/unit.component';
import { AddEditUnitComponent } from 'src/app/erp/Warehouses/master-codes/unit/add-edit-unit/add-edit-unit.component';
import { AddEditTaxComponent } from 'src/app/erp/Warehouses/master-codes/tax/add-edit-tax/add-edit-tax.component';
import { TaxComponent} from 'src/app/erp/Warehouses/master-codes/tax/tax.component'
import { AddEditStoreCardComponent } from './store-card/add-edit-store-card/add-edit-store-card.component';
import { StoreCardComponent } from './store-card/store-card.component';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { AddEditPaymentMethodComponent } from './payment-method/add-edit-payment-method/add-edit-payment-method.component';
import { SupplierCardComponent } from './supplier-card/supplier-card.component';
import { AddEditSupplierCardComponent } from './supplier-card/add-edit-supplier-card/add-edit-supplier-card.component';
import { ItemCardComponent } from './item-card/item-card.component';
import { AddEditItemCardComponent } from './item-card/add-edit-item-card/add-edit-item-card.component';
import { AddEditItemGroupsCardComponent } from './item-groups-card/add-edit-item-groups-card/add-edit-item-groups-card.component';
import { ItemGroupsCardComponent } from './item-groups-card/item-groups-card.component';
import { AddEditCustomerCardComponent } from './customer-card/add-edit-customer-card/add-edit-customer-card.component';
import { CustomerCardComponent } from './customer-card/customer-card.component';
import { AddEditBillTypeComponent } from './bill-type/add-edit-bill-type/add-edit-bill-type.component';
import { BillTypeComponent } from './bill-type/bill-type.component';
import { SalesPersonCardComponent } from './sales-person-card/sales-person-card.component';
import { AddSalesPersonCardComponent } from './sales-person-card/add-sales-person-card/add-sales-person-card.component';
import { AddSalesPersonCommissionCardComponent } from './sales-person-commission-card/add-sales-person-commission-card/add-sales-person-commission-card.component';
const routes: Routes = [
	{
		path: '',
		children: [
		
			{ path: 'period', component: PeriodComponent },
			{ path: 'period/add-period', component: AddEditPeriodComponent },
			{ path: 'period/update-period/:id', component: AddEditPeriodComponent },
			{ path: 'unit/add-unit', component: AddEditUnitComponent },
			{ path: 'unit/update-unit/:id', component: AddEditUnitComponent },
			{ path: 'unit', component: UnitComponent },
			{ path: 'tax/add-tax', component: AddEditTaxComponent },
			{ path: 'tax/update-tax/:id', component: AddEditTaxComponent },
			{ path: 'tax', component: TaxComponent },
			{ path: 'storeCard/add-storeCard', component: AddEditStoreCardComponent },
			{ path: 'storeCard/update-storeCard/:id', component: AddEditStoreCardComponent },
			{ path: 'storeCard', component: StoreCardComponent},
			{ path: 'storeCard/add-storeCard/:parentId', component: AddEditStoreCardComponent },
			{ path: 'paymentMethod', component: PaymentMethodComponent },
			{ path: 'paymentMethod/add-paymentMethod', component: AddEditPaymentMethodComponent },
			{ path: 'paymentMethod/update-paymentMethod/:id', component: AddEditPaymentMethodComponent },
			{ path: 'customerCard', component: CustomerCardComponent },
			{ path: 'customerCard/add-customerCard', component: AddEditCustomerCardComponent },
			{ path: 'customerCard/update-customerCard/:id', component: AddEditCustomerCardComponent },
			{ path: 'supplierCard', component: SupplierCardComponent },
			{ path: 'supplierCard/add-supplierCard', component: AddEditSupplierCardComponent },
			{ path: 'supplierCard/update-supplierCard/:id', component: AddEditSupplierCardComponent },
			{ path: 'itemCard', component: ItemCardComponent },
			{ path: 'itemCard/add-itemCard', component: AddEditItemCardComponent },
			{ path: 'itemCard/update-itemCard/:id', component: AddEditItemCardComponent },
			{ path: 'itemGroupsCard/add-itemGroupsCard', component: AddEditItemGroupsCardComponent },
			{ path: 'itemGroupsCard/update-itemGroupsCard/:id', component: AddEditItemGroupsCardComponent },
			{ path: 'itemGroupsCard', component: ItemGroupsCardComponent},
			{ path: 'itemGroupsCard/add-itemGroupsCard/:parentId', component: AddEditItemGroupsCardComponent },
			{ path: 'billType', component: BillTypeComponent },
			{ path: 'billType/add-billType', component: AddEditBillTypeComponent },
			{ path: 'billType/update-billType/:id', component: AddEditBillTypeComponent },
			{ path: 'sales-person-card', component: SalesPersonCardComponent },
			{ path: 'sales-person-card/add-sales-person-card', component: AddSalesPersonCardComponent },
			{ path: 'sales-person-card/update-sales-person-card/:id', component: AddSalesPersonCardComponent },
			{ path: 'sales-person-commission-card', component: SalesPersonCommissionCardComponent },
			{ path: 'sales-person-commission-card/add-sales-person-commission-card', component: AddSalesPersonCommissionCardComponent },
			{ path: 'sales-person-commission-card/update-sales-person-commission-card/:id', component: AddSalesPersonCommissionCardComponent },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	
})

export class MasterCodesRoutingModule { }
