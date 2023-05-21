import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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



@NgModule({
  declarations: [
    AddEditVoucherComponent, VouchersComponent, JournalEntryComponent, AddEditJournalEntryComponent

    
  ],
  imports: [
    CommonModule,
    OperationsRoutingModule, SharedModule, NgxSpinnerModule, NzTableModule,
    NzButtonModule,
    NzIconModule
  ],
  providers: []
})
export class OperationsModule { }
