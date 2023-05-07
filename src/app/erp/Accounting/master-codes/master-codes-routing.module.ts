import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditJournalsComponent } from './journals/add-edit-journals/add-edit-journals.component';
import { JournalsComponent } from './journals/journals.component';
import { FiscalPeriodsComponent } from '../master-codes/fiscal-periods/fiscal-periods.component';
import { AddEditFiscalPeriodsComponent } from '../master-codes/fiscal-periods/add-edit-fiscal-periods/add-edit-fiscal-periods.component'
import { AccountGroupsComponent } from './account-groups/account-groups.component';
import { AddEditAccountGroupsComponent } from './account-groups/add-edit-account-groups/add-edit-account-groups.component';
import { CostCentersComponent } from './cost-centers/cost-centers.component';
import { AddEditCostCenterComponent } from './cost-centers/add-edit-cost-center/add-edit-cost-center.component';
import { AccountsComponent } from './accounts/accounts.component';
import { AddEditAccountComponent } from './accounts/add-edit-account/add-edit-account.component';
import { AccountClassificationComponent } from './account-classification/account-classification.component';
import { AddEditAccountClassificationComponent } from './account-classification/add-edit-account-classification/add-edit-account-classification.component';
const routes: Routes = [
	{
		path: '',
		children: [
			{ path: 'journal', component: JournalsComponent },
			{ path: 'journal/add-journal', component: AddEditJournalsComponent },
			{ path: 'journal/update-journal/:id', component: AddEditJournalsComponent },
			{ path: 'fiscalPeriod', component: FiscalPeriodsComponent },
			{ path: 'fiscalPeriod/add-fiscalPeriod', component: AddEditFiscalPeriodsComponent },
			{ path: 'fiscalPeriod/update-fiscalPeriod/:id', component: AddEditFiscalPeriodsComponent },
			{ path: 'accountGroup', component: AccountGroupsComponent },
			{ path: 'accountGroup/add-accountGroup', component: AddEditAccountGroupsComponent },
			{ path: 'accountGroup/add-accountGroup/:parentId', component: AddEditAccountGroupsComponent },
			{ path: 'accountGroup/update-accountGroup/:id', component: AddEditAccountGroupsComponent },
			{ path: 'costCenter', component: CostCentersComponent },
			{ path: 'costCenter/add-costCenter', component: AddEditCostCenterComponent },
			{ path: 'costCenter/add-costCenter/:parentId', component: AddEditCostCenterComponent },
			{ path: 'costCenter/update-costCenter/:id', component: AddEditCostCenterComponent },

			{ path: 'account', component: AccountsComponent },
			{ path: 'account/add-account', component: AddEditAccountComponent },
			{ path: 'account/add-account/:parentId', component: AddEditAccountComponent },
			{ path: 'account/update-account/:id', component: AddEditAccountComponent },

			{ path: 'accountClassification', component: AccountClassificationComponent },
			{ path: 'accountClassification/add-accountClassification', component: AddEditAccountClassificationComponent },
			{ path: 'accountClassification/update-accountClassification/:id', component: AddEditAccountClassificationComponent },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MasterCodesRoutingModule { }
