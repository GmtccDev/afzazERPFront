import { SalesPersonCommissionServiceProxy } from './../Services/sales-person-commission.service';
import { SalesPersonCardServiceProxy } from './../Services/sales-person-card.service';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module'
import { MasterCodesRoutingModule } from './master-codes-routing.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { PeriodComponent } from './period/period.component';
import { AddEditPeriodComponent } from './period/add-edit-period/add-edit-period.component';
import { PeriodServiceProxy } from '../Services/period.service';
import { DateCalculation } from 'src/app/shared/services/date-services/date-calc.service';
import { DateConverterService } from 'src/app/shared/services/date-services/date-converter.service';
import { NgbCalendarIslamicUmalqura } from '@ng-bootstrap/ng-bootstrap';
import { UnitComponent } from 'src/app/erp/Warehouses/master-codes/unit/unit/unit.component';
import { AddEditUnitComponent } from 'src/app/erp/Warehouses/master-codes/unit/add-edit-unit/add-edit-unit.component';
import { AddEditUnitTransactionComponent } from 'src/app/erp/Warehouses/master-codes/unit/add-edit-unit-transaction/add-edit-unit-transaction.component';
import { TaxComponent } from './tax/tax.component';
import { AddEditTaxComponent } from './tax/add-edit-tax/add-edit-tax.component';
import { StoreCardComponent } from './store-card/store-card.component';
import { AddEditStoreCardComponent } from './store-card/add-edit-store-card/add-edit-store-card.component';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { AddEditPaymentMethodComponent } from './payment-method/add-edit-payment-method/add-edit-payment-method.component';
import { SupplierCardComponent } from './supplier-card/supplier-card.component';
import { AddEditSupplierCardComponent } from './supplier-card/add-edit-supplier-card/add-edit-supplier-card.component';
import { ItemCardComponent } from './item-card/item-card.component';
import { AddEditItemCardComponent } from './item-card/add-edit-item-card/add-edit-item-card.component';
import { ItemGroupsCardComponent } from './item-groups-card/item-groups-card.component';
import { AddEditItemGroupsCardComponent } from './item-groups-card/add-edit-item-groups-card/add-edit-item-groups-card.component';
import { CustomerCardComponent } from './customer-card/customer-card.component';
import { AddEditCustomerCardComponent } from './customer-card/add-edit-customer-card/add-edit-customer-card.component';
import { BillTypeComponent } from './bill-type/bill-type.component';
import { AddEditBillTypeComponent } from './bill-type/add-edit-bill-type/add-edit-bill-type.component';
import { SalesPersonCardComponent } from './sales-person-card/sales-person-card.component';
import { AddSalesPersonCardComponent } from './sales-person-card/add-sales-person-card/add-sales-person-card.component';
import { SalesPersonCommissionCardComponent } from './sales-person-commission-card/sales-person-commission-card.component';
import { AddSalesPersonCommissionCardComponent } from './sales-person-commission-card/add-sales-person-commission-card/add-sales-person-commission-card.component';
import { DeterminantsComponent } from './determinants/determinants.component';
import { AddEditDeterminantsComponent } from './determinants/add-edit-determinants/add-edit-determinants.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';



@NgModule({
  declarations: [
    PeriodComponent, AddEditPeriodComponent, UnitComponent, AddEditUnitComponent, AddEditUnitTransactionComponent, TaxComponent, AddEditTaxComponent
    , StoreCardComponent, AddEditStoreCardComponent, PaymentMethodComponent, AddEditPaymentMethodComponent
    , CustomerCardComponent, AddEditCustomerCardComponent, SupplierCardComponent, AddEditSupplierCardComponent
    , ItemCardComponent, AddEditItemCardComponent, ItemGroupsCardComponent, AddEditItemGroupsCardComponent,
    BillTypeComponent, AddEditBillTypeComponent, SalesPersonCardComponent, AddSalesPersonCardComponent, SalesPersonCommissionCardComponent, AddSalesPersonCommissionCardComponent, DeterminantsComponent, AddEditDeterminantsComponent, 
  ],
  imports: [
    CommonModule,
    MasterCodesRoutingModule, SharedModule, NgxSpinnerModule, NzTableModule,
    NzButtonModule,NgSelectModule,NzIconModule

  ],
  providers: [PeriodServiceProxy,SalesPersonCommissionServiceProxy,SalesPersonCardServiceProxy, DateCalculation, DatePipe, DateConverterService, NgbCalendarIslamicUmalqura
  ]
})
export class MasterCodesModule { }
