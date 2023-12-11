import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillComponent } from './bill/bill.component';
import { AddEditBillComponent } from './bill/add-edit-bill/add-edit-bill.component';
import { GenerateBillEntryComponent } from './bill/generate-bill-entry/generate-bill-entry.component';
import { SimpleVoucherComponent } from './simple-voucher/simple-voucher.component';
import { AddEditSimpleVoucherComponent } from './simple-voucher/add-edit-simple-voucher/add-edit-simpe-voucher.component';



const routes: Routes = [
	{
		path: '',
		children: [
			{ path: 'bill/:billTypeId', component: BillComponent },
			{ path: 'bill/add-bill/:billTypeId', component: AddEditBillComponent },
			{ path: 'bill/update-bill/:billTypeId/:id', component: AddEditBillComponent },
			{ path: 'generate-entry-bills', component: GenerateBillEntryComponent },
			{ path: 'simpleVoucher/:voucherTypeId', component: SimpleVoucherComponent },
			{ path: 'simpleVoucher/add-simpleVoucher/:voucherTypeId', component: AddEditSimpleVoucherComponent },
			{ path: 'simpleVoucher/update-simpleVoucher/:voucherTypeId/:id', component: AddEditSimpleVoucherComponent },

		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class OperationsRoutingModule { }
