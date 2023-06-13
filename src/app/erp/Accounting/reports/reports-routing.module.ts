import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BudgetReportComponent } from './budget-report/budget-report.component';
import { IncomeStatementReportComponent } from './income-statement-report/income-statement-report.component';
import { VouchersTransactionsReportComponent } from './vouchers-transactions-report/vouchers-trasnactions-report.component';
import { AnalyticalBudgetReportComponent } from './analytical-budget-report/analytical-budget-report.component';



const routes: Routes = [
	{
		path: '',
		children: [
			{ path: 'budgetReport', component: BudgetReportComponent },
			{ path: 'incomeStatementReport', component: IncomeStatementReportComponent },
			{ path: 'vouchersTransactionsReport', component: VouchersTransactionsReportComponent },
			{ path: 'analyticalBudgetReport', component: AnalyticalBudgetReportComponent },

		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ReportsRoutingModule { }
