import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterCodesRoutingModule } from './master-codes-routing.module';
import { PointOfSaleComponent } from './point-of-sale/point-of-sale.component';


@NgModule({
  declarations: [
    PointOfSaleComponent
  ],
  imports: [
    CommonModule,
    MasterCodesRoutingModule
  ]
})
export class MasterCodesModule { }
