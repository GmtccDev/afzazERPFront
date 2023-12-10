import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillComponent } from './bill/bill.component';
import { AddEditBillComponent } from './bill/add-edit-bill/add-edit-bill.component';
import { GenerateBillEntryComponent } from './bill/generate-bill-entry/generate-bill-entry.component';



const routes: Routes = [
	{
		path: '',
		children: [
			{ path: 'bill/:billTypeId', component: BillComponent },
			{ path: 'bill/add-bill/:billTypeId', component: AddEditBillComponent },
			{ path: 'bill/update-bill/:billTypeId/:id', component: AddEditBillComponent },
			{ path: 'generate-entry-bills', component: GenerateBillEntryComponent },

		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class OperationsRoutingModule { }
