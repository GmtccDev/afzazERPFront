import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AddEditVoucherComponent} from  'src/app/erp/Accounting/operations/vouchers/add-edit-voucher/add-edit-voucher.component';
import {VouchersComponent} from  'src/app/erp/Accounting/operations/vouchers/vouchers.component';


const routes: Routes = [
	{
		path: '',
		children: [
			{ path: 'vouchers', component: VouchersComponent },
			{ path: 'vouchers/add-voucher', component: AddEditVoucherComponent },
			{ path: 'vouchers/update-voucher/:id', component: AddEditVoucherComponent },
		
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class OperationsRoutingModule { }
