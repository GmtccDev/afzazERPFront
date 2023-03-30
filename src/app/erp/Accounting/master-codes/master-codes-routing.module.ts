import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditJournalsComponent } from './journals/add-edit-journals/add-edit-journals.component';
import { JournalsComponent } from './journals/journals.component';

const routes: Routes = [
	{
		path: '',
		children: [
			{ path: 'journal', component: JournalsComponent },
			{ path: 'journal/add-journal', component: AddEditJournalsComponent },
			{ path: 'journal/update-journal/:id', component: AddEditJournalsComponent },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MasterCodesRoutingModule { }
