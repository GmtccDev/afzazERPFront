import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountingConfigurationsComponent } from './accounting-configurations/accounting-configurations.component';
const routes: Routes = [
	{
		path: '',
		children: [
			{ path: 'accounting-configurations', component: AccountingConfigurationsComponent },
			
		]

	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ConfigurationsRoutingModule { }
