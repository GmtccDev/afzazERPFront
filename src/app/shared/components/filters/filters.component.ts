import { Component, OnInit, Output, Input, EventEmitter, OnDestroy, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { DateModel } from '../../model/date-model';
import { SharedService } from '../../common-services/shared-service';
import { DateConverterService} from 'src/app/shared/services/date-services/date-converter.service';
import { PublicService } from '../../services/public.service';


@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnInit,AfterViewInit, OnDestroy {

  selectedFromDate!: DateModel;
  selectedToDate!: DateModel;
  dateType: number = 1;
  enableFilters: boolean = false;
  lang = localStorage.getItem("language")
  selectedAccountGroupId: any;

  accountGroupList: any;
  routeAccountGroupApi = "AccountGroup/get-ddl?"

  selectedAccountId: any;
  accountList: any;
  routeAccountApi = "Account/get-ddl?"


  selectedCostCenterId: any;
  costCenterList: any;
  routeCostCenterApi = "CostCenter/get-ddl?"

  @Output() OnFilter: EventEmitter<{
    
     fromDate, toDate,accountGroupId,accountId
  }> = new EventEmitter();

  @Input() ShowOptions: {
    ShowFromDate: boolean,
    ShowToDate: boolean, ShowSearch:boolean,ShowAccountGroup:boolean,ShowAccount:boolean,
    ShowCostCenter:boolean
  } = {
    
      ShowFromDate: false,
      ShowToDate: false,
      ShowSearch:true,
      ShowAccountGroup:false,
      ShowAccount:false,
      ShowCostCenter:false
    }

  subsList: Subscription[] = [];
  lblFromDate: string = "من تاريخ";
  lblToDate: string = "إلى تاريخ";


  constructor(
    private sharedServices:SharedService,
    private dateConverterService: DateConverterService,
    private publicService: PublicService,

    private spinner: NgxSpinnerService) {
    this.GetData();
  }

  getLanguage() {
    this.sharedServices.getLanguage().subscribe(res => {
      this.lang = res
    })
  }
  ngOnInit() {
    this.getLanguage();
    //this.GetData();

  }
  ngAfterViewInit(): void {
    debugger;
   this.selectedFromDate = this.dateConverterService.getCurrentDate();
   this.selectedToDate = this.dateConverterService.getCurrentDate();
  }
  ngOnDestroy() {
    this.subsList.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    })
  }
  onSelectFromDate(e: DateModel) {
    debugger
    this.selectedFromDate = e
    this.FireSearch()
  }

  onSelectToDate(e: DateModel) {
    this.selectedToDate = e;
    this.FireSearch()
  }



  GetData() {
    this.spinner.show();
    
    Promise.all([
      this.getAccountGroup(),
      this.getAccount(),
      this.getCostCenter()
    ]).then(a => {
      ////(("All Data have been loaded. Enable Filters")
      this.enableFilters = true;
      this.spinner.hide();
    }).catch((err)=>{
      this.spinner.hide();
    })
  }


  getAccountGroup() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountGroupApi).subscribe({
        next: (res) => {

          if (res.success) {
            debugger
            this.accountGroupList = res.response;

          }


          resolve();

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });

      this.subsList.push(sub);
    });

  }

  getAccount() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountApi).subscribe({
        next: (res) => {

          if (res.success) {
            if(this.selectedAccountGroupId!=null && this.selectedAccountGroupId!=undefined)
            {
            this.accountList = res.response.filter(x=>x.accountGroupId==this.selectedAccountGroupId);
            }
            else
            {
              this.accountList = res.response;

            }

          }


          resolve();

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });

      this.subsList.push(sub);
    });

  }
 
  getCostCenter() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeCostCenterApi).subscribe({
        next: (res) => {
          if (res.success) {
          
              this.costCenterList = res.response;
          }
          resolve();

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });

      this.subsList.push(sub);
    });

  }



  FireSearch() {
  debugger
   if(!this.selectedFromDate)
   {
     this.selectedFromDate = this.dateConverterService.getCurrentDate();
   }
   if(!this.selectedToDate)
   {
     this.selectedToDate = this.dateConverterService.getCurrentDate();
   }
    this.OnFilter.emit({
     
      fromDate: this.selectedFromDate,
      toDate: this.selectedToDate,
      accountGroupId: this.selectedAccountGroupId,
      accountId: this.selectedAccountId

     

    })
  }
  onSelectAccountGroup() {
    this.FireSearch()

  }
  onSelectAccount() {
    this.FireSearch()

  }
  onSelectCostCenter() {
    this.FireSearch()

  }
}
