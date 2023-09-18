import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { AccountsComponent } from './accounts/accounts.component';
import { AddEditAccountComponent } from './accounts/add-edit-account/add-edit-account.component';
import { AccountClassificationComponent } from './account-classification/account-classification.component';
import { AddEditAccountClassificationComponent } from './account-classification/add-edit-account-classification/add-edit-account-classification.component';
import { VoucherTypeComponent } from './voucher-type/voucher-type.component';
import { AddEditVoucherTypeComponent } from './voucher-type/add-edit-voucher-type/add-edit-voucher-type.component';
import { BankAccountComponent } from './bank-account/bank-account.component';
import { AddEditBankAccountComponent } from './bank-account/add-edit-bank-account/add-edit-bank-account.component';
import { DateCalculation } from 'src/app/shared/services/date-services/date-calc.service';
import { DateConverterService } from 'src/app/shared/services/date-services/date-converter.service';
import { NgbCalendarIslamicUmalqura } from '@ng-bootstrap/ng-bootstrap';
@NgModule({
  declarations: [
    JournalsComponent, AddEditJournalsComponent,AddEditFiscalPeriodsComponent,FiscalPeriodsComponent,
    AccountGroupsComponent, AddEditAccountGroupsComponent, CostCentersComponent,
    AddEditCostCenterComponent, AccountsComponent, AddEditAccountComponent,
    AccountClassificationComponent, AddEditAccountClassificationComponent,
    VoucherTypeComponent,AddEditVoucherTypeComponent,BankAccountComponent, AddEditBankAccountComponent
  ],
  imports: [
    CommonModule,
    MasterCodesRoutingModule, SharedModule, NgxSpinnerModule, NzTableModule,
    NzButtonModule,
    NzIconModule
  ],
  providers: [JournalServiceProxy,FiscalPeriodServiceProxy,DateCalculation,DatePipe,DateConverterService,NgbCalendarIslamicUmalqura]
})
export class MasterCodesModule { }
