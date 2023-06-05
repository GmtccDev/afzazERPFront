import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BudgetReportComponent } from './budget-report/budget-report.component';



const routes: Routes = [
	{
		path: '',
		children: [
			{ path: 'budgetReport', component: BudgetReportComponent },
	
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ReportsRoutingModule { }
