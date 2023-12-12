
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationsConfigurationsComponent } from './notifications-configurations/notifications-configurations.component'
import { NotificationsManagementComponent } from './notifications-management/notifications-management.component';
import { RecipientGroupsComponent } from './recipient-groups/recipient-groups.component';
import { BeneficiariesComponent } from './beneficiaries/beneficiaries.component';
const routes: Routes = [
	{
		path: '',
		children: [
			{ path: 'notificationsConfigurations', component: NotificationsConfigurationsComponent },
			{ path: 'notifictionsManagement', component: NotificationsManagementComponent },
			{ path: 'recipientGroups', component: RecipientGroupsComponent },
			{ path: 'beneficiaries', component: BeneficiariesComponent },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class NotifictionsSettingsRoutingModule { }
