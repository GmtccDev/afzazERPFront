import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../../../shared/shared.module'
import { NgxSpinnerModule } from 'ngx-spinner';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { BudgetReportComponent } from './budget-report/budget-report.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { NgbCalendarIslamicUmalqura } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    BudgetReportComponent
    
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule, SharedModule, NgxSpinnerModule, NzTableModule,
    NzButtonModule,
    NzIconModule
    
    
    
  ],
  providers: [NgbCalendarIslamicUmalqura]
})
export class ReportsModule { }
