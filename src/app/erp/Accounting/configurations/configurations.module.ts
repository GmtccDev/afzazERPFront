import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from "../../../shared/shared.module";
import { AccountingConfigurationsComponent } from './accounting-configurations/accounting-configurations.component';
import { ConfigurationsRoutingModule } from './configurations-routing.module';



@NgModule({
	declarations: [ AccountingConfigurationsComponent],
	imports: [
		CommonModule,
		SharedModule,
		ConfigurationsRoutingModule
	],
	providers:[]
})
export class ConfigurationsModule { }
