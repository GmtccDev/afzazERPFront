import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { MasterCodesRoutingModule } from './master-codes-routing.module';
import { PointOfSaleComponent } from './point-of-sale/point-of-sale.component';
import { ShiftsComponent } from './shifts/shifts.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
	declarations: [
		PointOfSaleComponent,
		ShiftsComponent
	],
	imports: [
		CommonModule,
		MasterCodesRoutingModule, NgSelectModule, FormsModule, TranslateModule
	]
})
export class MasterCodesModule { }
