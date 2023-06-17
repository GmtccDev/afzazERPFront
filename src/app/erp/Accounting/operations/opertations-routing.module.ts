import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AddEditVoucherComponent} from  'src/app/erp/Accounting/operations/vouchers/add-edit-voucher/add-edit-voucher.component';
import {VouchersComponent} from  'src/app/erp/Accounting/operations/vouchers/vouchers.component';
import { AddEditJournalEntryComponent } from './journal-entry/add-edit-journal-entry/add-edit-journal-entry.component';
import { JournalEntryComponent } from './journal-entry/journal-entry.component';
import { JournalEntryPostComponent } from './journal-entry/journal-entry-post/journal-entry-post.component';


const routes: Routes = [
	{
		path: '',
		children: [
			{ path: 'vouchers/:voucherTypeId', component: VouchersComponent },
			{ path: 'vouchers/add-voucher/:voucherTypeId', component: AddEditVoucherComponent },
			{ path: 'vouchers/update-voucher/:voucherTypeId/:id', component: AddEditVoucherComponent },
			{ path: 'journalEntry', component: JournalEntryComponent },
			{ path: 'journalEntryPost', component: JournalEntryPostComponent },
			{ path: 'journalEntry/add-journalEntry', component: AddEditJournalEntryComponent },
			{ path: 'journalEntry/update-journalEntry/:id', component: AddEditJournalEntryComponent },
		
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class OperationsRoutingModule { }
