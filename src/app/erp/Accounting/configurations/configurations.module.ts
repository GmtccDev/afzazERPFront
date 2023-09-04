import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from "../../../shared/shared.module";
import { AccountingConfigurationsComponent } from './accounting-configurations/accounting-configurations.component';
import { ConfigurationsRoutingModule } from './configurations-routing.module';
import { NgxSpinnerModule } from 'ngx-spinner';



@NgModule({
	declarations: [ AccountingConfigurationsComponent],
	imports: [
		CommonModule,
		SharedModule,
		ConfigurationsRoutingModule,
		NgxSpinnerModule
	],
	providers:[]
})
export class ConfigurationsModule { }
