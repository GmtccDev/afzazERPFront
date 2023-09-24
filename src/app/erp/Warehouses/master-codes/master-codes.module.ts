import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {SharedModule} from '../../../shared/shared.module'
import { MasterCodesRoutingModule } from './master-codes-routing.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { WarehousesPeriodsComponent } from './warehouses-periods/warehouses-periods.component';
import { AddEditWarehousesPeriodsComponent } from './warehouses-periods/add-edit-warehouses-periods/add-edit-warehouses-periods.component';
import { WarehousesPeriodServiceProxy } from '../Services/warehousesperiod.service';
import { DateCalculation } from 'src/app/shared/services/date-services/date-calc.service';
import { DateConverterService } from 'src/app/shared/services/date-services/date-converter.service';
import { NgbCalendarIslamicUmalqura } from '@ng-bootstrap/ng-bootstrap';
import { WarehousesUnitsComponent } from 'src/app/erp/Warehouses/master-codes/warehouses-units/warehouses-units/warehouses-units.component';
import { AddwarehousesUnitComponent } from 'src/app/erp/Warehouses/master-codes/warehouses-units/add-warehouses-unit/add-warehouses-unit.component';
import { AddEditWarehousesUnitTransactionsComponent } from 'src/app/erp/Warehouses/master-codes/warehouses-units/add-edit-warehouses-unit-transactions/add-edit-warehouses-unit-transactions.component';
import { WarehousesTaxComponent } from './warehouses-taxes/warehouses-taxes.component';
import { AddEditWarehousesTaxComponent } from './warehouses-taxes/add-edit-warehouses-tax/add-edit-warehouses-tax.component';
import { StoreCardComponent } from './store-card/store-card.component';
import { AddEditStoreCardComponent } from './store-card/add-edit-store-card/add-edit-store-card.component';
import { WarehousesPaymentMethodsComponent } from './warehouses-payment-methods/warehouses-payment-methods.component';
import { AddEditWarehousesPaymentMethodsComponent } from './warehouses-payment-methods/add-edit-warehouses-payment-methods/add-edit-warehouses-payment-methods.component';




@NgModule({
  declarations: [
    WarehousesPeriodsComponent, AddEditWarehousesPeriodsComponent,WarehousesUnitsComponent,AddwarehousesUnitComponent,AddEditWarehousesUnitTransactionsComponent,WarehousesTaxComponent,AddEditWarehousesTaxComponent
    , StoreCardComponent, AddEditStoreCardComponent,WarehousesPaymentMethodsComponent, AddEditWarehousesPaymentMethodsComponent
  ],
  imports: [
    CommonModule,
    MasterCodesRoutingModule, SharedModule, NgxSpinnerModule, NzTableModule,
    NzButtonModule,
    NzIconModule
  ],
  providers: [WarehousesPeriodServiceProxy,DateCalculation,DatePipe,DateConverterService,NgbCalendarIslamicUmalqura 
  ]
})
export class MasterCodesModule { }
