import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../../../shared/shared.module'
import { MasterCodesRoutingModule } from './master-codes-routing.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { JournalsComponent } from './journals/journals.component';
import { AddEditJournalsComponent } from './journals/add-edit-journals/add-edit-journals.component';
import { JournalServiceProxy } from '../services/journal.service';

@NgModule({
  declarations: [ 
    JournalsComponent, AddEditJournalsComponent
  ],
  imports: [
    CommonModule,
    MasterCodesRoutingModule, SharedModule, NgxSpinnerModule,
  ],
  providers: [JournalServiceProxy]
})
export class MasterCodesModule { }
