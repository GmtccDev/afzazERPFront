import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AddEditVoucherComponent} from  'src/app/erp/Accounting/operations/vouchers/add-edit-voucher/add-edit-voucher.component';
import {VouchersComponent} from  'src/app/erp/Accounting/operations/vouchers/vouchers.component';
import { AddEditJournalEntryComponent } from './journal-entry/add-edit-journal-entry/add-edit-journal-entry.component';
import { JournalEntryComponent } from './journal-entry/journal-entry.component';
import { JournalEntryPostComponent } from './journal-entry/journal-entry-post/journal-entry-post.component';
import { AddEditJournalEntryPostComponent } from './journal-entry/add-edit-journal-entry-post/add-edit-journal-entry-post.component';
import { CloseFiscalPeriodComponent } from './close-fiscal-period/close-fiscal-period.component';
import { IncomingChequeComponent } from './incoming-cheque/incoming-cheque.component';
import { AddEditIncomingChequeComponent } from './incoming-cheque/add-edit-incoming-cheque/add-edit-incoming-cheque.component';
import { IssuingChequeComponent } from './issuing-cheque/issuing-cheque.component';
import { AddEditIssuingChequeComponent } from './issuing-cheque/add-edit-issuing-cheque/add-edit-issuing-cheque.component';
import {PostVoucherComponent} from  'src/app/erp/Accounting/operations/vouchers/post-voucher/post-voucher.component';


const routes: Routes = [
	{
		path: '',
		children: [
			{ path: 'vouchers/:voucherTypeId', component: VouchersComponent },
			{ path: 'vouchers/add-voucher/:voucherTypeId', component: AddEditVoucherComponent },
			{ path: 'vouchers/update-voucher/:voucherTypeId/:id', component: AddEditVoucherComponent },
			{ path: 'postVoucher', component: PostVoucherComponent },
			{ path: 'journalEntry', component: JournalEntryComponent },
			{ path: 'journalEntryPost', component: JournalEntryPostComponent },
			{ path: 'journalEntry/add-journalEntry', component: AddEditJournalEntryComponent },
			{ path: 'journalEntry/update-journalEntry/:id', component: AddEditJournalEntryComponent },
			{ path: 'journalEntryPost/add-journalEntryPost', component: AddEditJournalEntryPostComponent },
			{ path: 'journalEntryPost/update-journalEntryPost/:id', component: AddEditJournalEntryPostComponent },
			{ path: 'closeFiscalPeriod', component: CloseFiscalPeriodComponent },
			{ path: 'incomingCheque', component: IncomingChequeComponent },
			{ path: 'incomingCheque/add-incomingCheque', component: AddEditIncomingChequeComponent },
			{ path: 'incomingCheque/update-incomingCheque/:id', component: AddEditIncomingChequeComponent },
			{ path: 'issuingCheque', component: IssuingChequeComponent },
			{ path: 'issuingCheque/add-issuingCheque', component: AddEditIssuingChequeComponent },
			{ path: 'issuingCheque/update-issuingCheque/:id', component: AddEditIssuingChequeComponent },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class OperationsRoutingModule { }
