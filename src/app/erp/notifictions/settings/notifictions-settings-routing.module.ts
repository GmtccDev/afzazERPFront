
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationsConfigurationsComponent } from './notifications-configurations/notifications-configurations.component'
import { NotificationsManagementComponent } from './notifications-management/notifications-management.component';
const routes: Routes = [
	{
		path: '',
		children: [
			{ path: 'notificationsConfigurations', component: NotificationsConfigurationsComponent },
			{ path: 'notifictionsManagement', component: NotificationsManagementComponent },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class NotifictionsSettingsRoutingModule { }
