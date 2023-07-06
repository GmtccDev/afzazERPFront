import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import {ReportServiceProxy} from 'src/app/shared/common-services/report.service';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { DateConverterService } from 'src/app/shared/services/date-services/date-converter.service';
import {NgbdModalContent} from 'src/app/shared/components/modal/modal-component'
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { TranslateService } from '@ngx-translate/core';
import { GeneralConfigurationServiceProxy } from 'src/app/erp/Accounting/services/general-configurations.services';
import { FiscalPeriodServiceProxy } from 'src/app/erp/Accounting/services/fiscal-period.services';
@Component({
  selector: 'app-budget-report',
  templateUrl: './budget-report.component.html',
  styleUrls: ['./budget-report.component.scss']
})
export class BudgetReportComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  lang = localStorage.getItem("language");
  companyId: string = localStorage.getItem("companyId");

  facialPeriodId:any;
  subsList: Subscription[] = [];
  fromDate: any;
  toDate: any;
  entriesStatusId:any;
  reportOptionId:any;

  level:any;
  toolbarPathData: ToolbarPath = {
    listPath: '',
    addPath: '',
    updatePath: '',
    componentList: this.translate.instant("component-names.budget-report"),
    componentAdd: '',
  };
  //#region Constructor
  constructor(
    private modalService: NgbModal,
    private reportService: ReportServiceProxy,
    private sharedServices: SharedService,
    private dateConverterService: DateConverterService,
    private translate: TranslateService,
    private generalConfigurationService: GeneralConfigurationServiceProxy,
    private fiscalPeriodService: FiscalPeriodServiceProxy,
  ) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
   
   this.sharedServices.changeButton({ action: 'Report' } as ToolbarData);
   this.listenToClickedButton();
   this.sharedServices.changeToolbarPath(this.toolbarPathData);

  }

  ngAfterViewInit(): void {
debugger
    this.getGeneralConfigurationsOfAccountingPeriod()
   //this.fromDate=this.dateConverterService.getDateForCalender(localStorage.getItem("fromDateOfFacialPeriod"));
   debugger
   //this.toDate=this.dateConverterService.getDateForCalender(localStorage.getItem("toDateOfFacialPeriod"));
  
  }
  getGeneralConfigurationsOfAccountingPeriod() {
    debugger
    const promise = new Promise<void>((resolve, reject) => {
      debugger
      this.generalConfigurationService.getGeneralConfiguration(6).subscribe({
        next: (res: any) => {
          debugger
          console.log('result data getbyid', res);
          if (res.response.value > 0) {
            debugger
            this.facialPeriodId = res.response.value;
            this.getfiscalPeriodById(this.facialPeriodId);
          }


        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });
    });
    return promise;

  }
  getfiscalPeriodById(id: any) {
    const promise = new Promise<void>((resolve, reject) => {
      this.fiscalPeriodService.getFiscalPeriod(id).subscribe({
        next: (res: any) => {
          debugger
          console.log('result data getbyid', res);
          this.fromDate=this.dateConverterService.getDateForCalender(res.response.fromDate);
          this.toDate=this.dateConverterService.getDateForCalender(res.response.toDate);

          //formatDate(Date.parse(res.response.fromDate)),
         // this.selectedToDate=formatDate(Date.parse(res.response.toDate)),

        
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });
    });
    return promise;
  }

  //#endregion

  //#region ngOnDestroy
  ngOnDestroy() {
    this.subsList.forEach((s) => {
      if (s) {
        s.unsubscribe();
      }
    });
  }
  //#endregion

  gotoViewer() {
 
    
    let monthFrom;
    let monthTo;

    if (this.fromDate == undefined || this.fromDate == null) {
      // this.fromDate = this.dateConverterService.getCurrentDate();
      monthFrom = Number(this.fromDate.month + 1)
      this.fromDate = (this.fromDate.year+'-'+ monthFrom + "-" + this.fromDate.day).toString();
    }
    else
    {
      monthFrom = Number(this.fromDate.month + 1)
      this.fromDate = (this.fromDate.year+'-'+ monthFrom + "-" + this.fromDate.day).toString();

    }

    if (this.toDate == undefined || this.toDate == null) {
      // this.toDate = this.dateConverterService.getCurrentDate();
      monthTo = Number(this.toDate.month + 1)
      this.toDate = (this.toDate.year+'-'+monthTo+ "-" + this.toDate.day).toString();

    }
    else
    {
      monthTo = Number(this.toDate.month + 1)
      this.toDate = (this.toDate.year+'-'+monthTo + "-" + this.toDate.day).toString();
    }
    if (this.entriesStatusId == null || this.entriesStatusId == undefined) {
      this.entriesStatusId = 0;
    }
    if (this.level == null || this.level == undefined) {
      this.level = 1;
    }
    let reportParams: string =
      "reportParameter=fromDate!" + this.fromDate +
      "&reportParameter=toDate!" + this.toDate+
      "&reportParameter=entriesStatusId!" + this.entriesStatusId +
      "&reportParameter=level!" + this.level+ 
      "&reportParameter=reportOptionId!" + this.reportOptionId+
      "&reportParameter=lang!" + this.lang+
      "&reportParameter=companyId!" + this.companyId;

    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.reportParams = reportParams;
    modalRef.componentInstance.reportType = 1;
    modalRef.componentInstance.reportTypeID = 1;

  }
  cancelDefaultReportStatus() {
    this.reportService.cancelDefaultReport(1,1).subscribe(resonse => {

    });
  }
  ShowOptions: {
     ShowFromDate: boolean, ShowToDate: boolean
    ShowSearch: boolean,ShowEntriesStatus:boolean,ShowLevel:boolean,ShowReportOptions:boolean
  } = {
      
      ShowFromDate: true, ShowToDate: true
      , ShowSearch: false,ShowEntriesStatus:true,ShowLevel:true,ShowReportOptions:true
      
    }

  OnFilter(e: {
    fromDate, toDate,entriesStatusId,level,reportOptionId
  }) {
      this.fromDate = e.fromDate,
      this.toDate = e.toDate,
      this.entriesStatusId=e.entriesStatusId,
      this.level=e.level,
      this.reportOptionId=e.reportOptionId

  }

  listenToClickedButton() {
    let sub = this.sharedServices.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {
        currentBtn;
        if (currentBtn != null) {
          
          if (currentBtn.action == ToolbarActions.Print) {
            this.gotoViewer();

          }
          else if (currentBtn.action == ToolbarActions.CancelDefaultReport) {
            this.cancelDefaultReportStatus();
          }
          this.sharedServices.changeButton({ action: 'Report' } as ToolbarData);
        }
      },
    });
    this.subsList.push(sub);
  }

}
