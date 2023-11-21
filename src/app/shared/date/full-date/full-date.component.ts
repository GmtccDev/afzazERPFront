import { CompanyDto } from './../../../erp/master-codes/models/company';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { DateModel } from '../../model/date-model';
import { Subscription } from 'rxjs';
import { CompanyServiceProxy } from 'src/app/erp/master-codes/services/company.service';
import { UserService } from '../../common-services/user.service';
@Component({
  selector: 'app-full-date',
  templateUrl: './full-date.component.html',
  styleUrls: ['./full-date.component.scss']
})
export class FullDateComponent implements OnInit,OnDestroy {

  @Input() dateType:number = 1;
  @Input() selectedDate?:DateModel;

  companyId: string = this.userService.getCompanyId()
  @Output() OnDateSelect:EventEmitter<DateModel> = new EventEmitter();

  @Output() OnDateTypeChange:EventEmitter<number> = new EventEmitter();
  constructor(private companyService:CompanyServiceProxy,private userService: UserService) { }
 
//,hour:number, min:number, sec:number
  getSelectedDate(e:DateModel)
  {

    this.selectedDate = e;
    let d = new Date();
    this.OnDateSelect.emit({
      day:e.day,
      month:e.month,
      year:e.year,
     hour:d.getHours(),
     min:d.getMinutes(),
     sec:d.getSeconds()
    });
  }



  ngOnInit(): void {
    let d = new Date();
    //, hour:d.getHours(), min:d.getMinutes(), sec:d.getSeconds()
    this.selectedDate = {year:d.getFullYear(), month:d.getMonth(), day:d.getDate(), hour:d.getHours(), min:d.getMinutes(), sec:d.getSeconds()}
    this.getCompanyById(this.companyId);

  }
  ngOnDestroy() {
    this.subsList.forEach((s) => {
      if (s) {
        s.unsubscribe();
      }
    });
  }
  changeDateType(type:number) {

    this.dateType = type;
    this.OnDateTypeChange.emit(this.dateType);
  }
  
  subsList: Subscription[] = [];
  useHijri:false;

  
  getCompanyById(id: any) {
    return new Promise<void>((resolve, reject) => {
     
      let sub = this.companyService.getCompany(id).subscribe({
        next: (res: any) => {
          debugger;
          
          if(res?.response?.useHijri)
          {
            this.dateType=2
          }else{
            this.dateType=1
          }

          resolve();
      
       

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });
      this.subsList.push(sub);

    });
  }

}
