import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {SharedModule} from '../../../shared/shared.module'
import { NgxSpinnerModule } from 'ngx-spinner';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { OperationsRoutingModule } from './opertations-routing.module';
import { AddEditVoucherComponent } from './vouchers/add-edit-voucher/add-edit-voucher.component';
import { VouchersComponent } from './vouchers/vouchers.component';
import { JournalEntryComponent } from './journal-entry/journal-entry.component';
import { AddEditJournalEntryComponent } from './journal-entry/add-edit-journal-entry/add-edit-journal-entry.component';
import { SearchDialogService } from 'src/app/shared/services/search-dialog.service';
import { MatDialogModule } from '@angular/material/dialog';
import { DateCalculation } from 'src/app/shared/services/date-services/date-calc.service';
import { NgbCalendarIslamicUmalqura } from '@ng-bootstrap/ng-bootstrap';
import { IncomingChequeComponent } from './incoming-cheque/incoming-cheque.component';
import { AddEditIncomingChequeComponent } from './incoming-cheque/add-edit-incoming-cheque/add-edit-incoming-cheque.component';
import { JournalEntryPostComponent } from './journal-entry/journal-entry-post/journal-entry-post.component';
import { AddEditJournalEntryPostComponent } from './journal-entry/add-edit-journal-entry-post/add-edit-journal-entry-post.component';
import { CloseFiscalPeriodComponent } from './close-fiscal-period/close-fiscal-period.component';
import { IssuingChequeComponent } from './issuing-cheque/issuing-cheque.component';
import { AddEditIssuingChequeComponent } from './issuing-cheque/add-edit-issuing-cheque/add-edit-issuing-cheque.component';
import { DateConverterService } from 'src/app/shared/services/date-services/date-converter.service';
import { NgSelectModule } from '@ng-select/ng-select';
import {GenerateEntryVoucherComponent} from  'src/app/erp/Accounting/operations/vouchers/generate-entry-voucher/generate-entry-voucher.component';


@NgModule({
  declarations: [
    AddEditVoucherComponent, VouchersComponent, JournalEntryComponent, AddEditJournalEntryComponent, IncomingChequeComponent, AddEditIncomingChequeComponent, JournalEntryPostComponent, AddEditJournalEntryPostComponent
    ,CloseFiscalPeriodComponent
    ,IssuingChequeComponent, AddEditIssuingChequeComponent,GenerateEntryVoucherComponent
  ],
  imports: [
    CommonModule,
    OperationsRoutingModule, SharedModule, NgxSpinnerModule, NzTableModule,
    NzButtonModule,
    NzIconModule,
    MatDialogModule,
    NgSelectModule

    
  ],
  providers: [SearchDialogService,DateCalculation,DatePipe,DateConverterService,NgbCalendarIslamicUmalqura]
})
export class OperationsModule { }
