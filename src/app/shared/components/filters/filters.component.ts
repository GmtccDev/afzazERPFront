import { Component, OnInit, Output, Input, EventEmitter, OnDestroy, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { DateModel } from '../../model/date-model';
import { SharedService } from '../../common-services/shared-service';
import { DateConverterService} from 'src/app/shared/services/date-services/date-converter.service';


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
  lang

  @Output() OnFilter: EventEmitter<{
    
     fromDate, toDate
  }> = new EventEmitter();

  @Input() ShowOptions: {
    ShowFromDate: boolean,
    ShowToDate: boolean, ShowSearch:boolean
  } = {
    
      ShowFromDate: false,
      ShowToDate: false,
      ShowSearch:true
     
    }

  subsList: Subscription[] = [];
  lblFromDate: string = "من تاريخ";
  lblToDate: string = "إلى تاريخ";


  constructor(
    private sharedServices:SharedService,
    private dateConverterService: DateConverterService,
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
    
    //
    // this.GetData();

  }
  ngAfterViewInit(): void {
    debugger;
   // this.selectedFromDate = this.dateConverterService.getCurrentDate();
   // this.selectedToDate = this.dateConverterService.getCurrentDate();
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
     
    ]).then(a => {
      ////(("All Data have been loaded. Enable Filters")
      this.enableFilters = true;
      this.spinner.hide();
    }).catch((err)=>{
      this.spinner.hide();
    })
  }





  ngOnDestroy() {
    this.subsList.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    })
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
     

    })
  }

}
