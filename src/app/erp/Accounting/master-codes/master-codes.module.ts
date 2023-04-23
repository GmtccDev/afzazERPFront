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
import { AccountGroupsComponent } from './account-groups/account-groups.component';
import { AddEditAccountGroupsComponent } from './account-groups/add-edit-account-groups/add-edit-account-groups.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CostCentersComponent } from './cost-centers/cost-centers.component';
import { AddEditCostCenterComponent } from './cost-centers/add-edit-cost-center/add-edit-cost-center.component';
@NgModule({
  declarations: [
    JournalsComponent, AddEditJournalsComponent,AddEditFiscalPeriodsComponent,FiscalPeriodsComponent, AccountGroupsComponent, AddEditAccountGroupsComponent, CostCentersComponent, AddEditCostCenterComponent
  ],
  imports: [
    CommonModule,
    MasterCodesRoutingModule, SharedModule, NgxSpinnerModule, NzTableModule,
    NzButtonModule,
    NzIconModule
  ],
  providers: [JournalServiceProxy,FiscalPeriodServiceProxy]
})
export class MasterCodesModule { }
