import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {SharedModule} from '../../../shared/shared.module'
import { NgxSpinnerModule } from 'ngx-spinner';
import { NzTableModule } from 'ng-zorro-antd/table';   
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { OperationsRoutingModule } from './opertations-routing.module';
import { SearchDialogService } from '../../../shared/services/search-dialog.service';
import { MatDialogModule } from '@angular/material/dialog';
import { DateCalculation } from '../../../shared/services/date-services/date-calc.service';
import { NgbCalendarIslamicUmalqura } from '@ng-bootstrap/ng-bootstrap';
import { DateConverterService } from '../../../shared/services/date-services/date-converter.service';
import { NgSelectModule } from '@ng-select/ng-select';
import {BillComponent} from 'src/app/erp/Warehouses/operations/bill/bill.component'
import {AddEditBillComponent} from 'src/app/erp/Warehouses/operations/bill/add-edit-bill/add-edit-bill.component';
import { BillDynamicDeterminantComponent } from './bill-dynamic-determinant/bill-dynamic-determinant.component';
import { GenerateBillEntryComponent } from './bill/generate-bill-entry/generate-bill-entry.component'



@NgModule({
  declarations: [
     BillComponent,AddEditBillComponent, BillDynamicDeterminantComponent, GenerateBillEntryComponent
  ],
  imports: [
    CommonModule,
    OperationsRoutingModule, SharedModule, NgxSpinnerModule, NzTableModule,
    NzButtonModule,
    NzIconModule,
    MatDialogModule,
    NgSelectModule

    
  ],
  providers: [SearchDialogService,DateCalculation,DatePipe,DateConverterService,NgbCalendarIslamicUmalqura]
})
export class OperationsModule { }
