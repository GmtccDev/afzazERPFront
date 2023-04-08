import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../../../shared/shared.module'
import { MasterCodesRoutingModule } from './master-codes-routing.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { JournalsComponent } from './journals/journals.component';
import { AddEditJournalsComponent } from './journals/add-edit-journals/add-edit-journals.component';
import { JournalServiceProxy } from '../services/journal.service';
import { AddEditFiscalPeriodsComponent } from './fiscal-periods/add-edit-fiscal-periods/add-edit-fiscal-periods.component';
import { FiscalPeriodsComponent } from './fiscal-periods/fiscal-periods.component';
import { FiscalPeriodServiceProxy } from '../services/fiscal-period.services';

@NgModule({
  declarations: [ 
    JournalsComponent, AddEditJournalsComponent,AddEditFiscalPeriodsComponent,FiscalPeriodsComponent
  ],
  imports: [
    CommonModule,
    MasterCodesRoutingModule, SharedModule, NgxSpinnerModule,
  ],
  providers: [JournalServiceProxy,FiscalPeriodServiceProxy]
})
export class MasterCodesModule { }
