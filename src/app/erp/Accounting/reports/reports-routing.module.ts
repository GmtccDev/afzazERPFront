import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BudgetReportComponent } from './budget-report/budget-report.component';
import { IncomeStatementReportComponent } from './income-statement-report/income-statement-report.component';
import { VouchersTransactionsReportComponent } from './vouchers-transactions-report/vouchers-trasnactions-report.component';
import { GeneralLedgerReportComponent } from './general-ledger-report/general-ledger-report.component';



const routes: Routes = [
	{
		path: '',
		children: [
			{ path: 'budgetReport', component: BudgetReportComponent },
			{ path: 'incomeStatementReport', component: IncomeStatementReportComponent },
			{ path: 'vouchersTransactionsReport', component: VouchersTransactionsReportComponent },
			{ path: 'generalLedgerReport', component: GeneralLedgerReportComponent },


		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ReportsRoutingModule { }
