import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditJournalsComponent } from './journals/add-edit-journals/add-edit-journals.component';
import { JournalsComponent } from './journals/journals.component';
import {FiscalPeriodsComponent} from '../master-codes/fiscal-periods/fiscal-periods.component';
import {AddEditFiscalPeriodsComponent} from '../master-codes/fiscal-periods/add-edit-fiscal-periods/add-edit-fiscal-periods.component'
import { AccountGroupsComponent } from './account-groups/account-groups.component';
import { AddEditAccountGroupsComponent } from './account-groups/add-edit-account-groups/add-edit-account-groups.component';
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
			{ path:'accountGroup',component:AccountGroupsComponent},
			{ path: 'accountGroup/add-accountGroup', component: AddEditAccountGroupsComponent },
			{ path: 'accountGroup/add-accountGroup/:parentId', component: AddEditAccountGroupsComponent },
			{ path: 'accountGroup/update-accountGroup/:id', component: AddEditAccountGroupsComponent },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MasterCodesRoutingModule { }
