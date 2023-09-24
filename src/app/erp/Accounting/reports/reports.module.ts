import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../../../shared/shared.module'
import { NgxSpinnerModule } from 'ngx-spinner';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { BudgetReportComponent } from './budget-report/budget-report.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { NgbCalendarIslamicUmalqura } from '@ng-bootstrap/ng-bootstrap';
import { IncomeStatementReportComponent } from './income-statement-report/income-statement-report.component';
import { VouchersTransactionsReportComponent } from './vouchers-transactions-report/vouchers-trasnactions-report.component'
import { GeneralLedgerReportComponent } from './general-ledger-report/general-ledger-report.component';
import { JournalEntriesReportComponent } from './journal-entries-report/journal-entries-report.component'
import { CostCentersReportComponent } from './cost-centers-report/cost-centers-report.component';
import { AccountsBalanceReportComponent } from './accounts-balance-report/accounts-balance-report.component';
import { TrailBalanceReportComponent } from './trail-balance-report/trail-balance-report.component'



@NgModule({
  declarations: [
    BudgetReportComponent,
    IncomeStatementReportComponent,
    VouchersTransactionsReportComponent,
    GeneralLedgerReportComponent, JournalEntriesReportComponent,
    CostCentersReportComponent,
    AccountsBalanceReportComponent,
    TrailBalanceReportComponent,


  ],
  imports: [
    CommonModule,
    ReportsRoutingModule, SharedModule, NgxSpinnerModule, NzTableModule,
    NzButtonModule,
    NzIconModule



  ],
  providers: [NgbCalendarIslamicUmalqura]
})
export class ReportsModule { }
