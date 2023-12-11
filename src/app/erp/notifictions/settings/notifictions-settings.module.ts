import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NotifictionsSettingsRoutingModule } from './notifictions-settings-routing.module';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationsConfigurationsComponent } from './notifications-configurations/notifications-configurations.component';
import { NotificationsManagementComponent } from './notifications-management/notifications-management.component'
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

@NgModule({
	declarations: [
		NotificationsConfigurationsComponent,
		NotificationsManagementComponent

	],
	imports: [
		CommonModule,
		NotifictionsSettingsRoutingModule, NgSelectModule, FormsModule, TranslateModule, NgbNavModule,
		CKEditorModule,


	]
})
export class NotifictionsSettingsModule { }
