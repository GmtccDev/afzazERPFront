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
import { GeneralConfigurationServiceProxy } from '../../services/general-configurations.services';
import { FiscalPeriodServiceProxy } from '../../services/fiscal-period.services';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-cost-centers-report',
  templateUrl: './cost-centers-report.component.html',
  styleUrls: ['./cost-centers-report.component.scss']
})
export class CostCentersReportComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  facialPeriodId:any;

  companyId: string = localStorage.getItem("companyId");
  lang = localStorage.getItem("language");
  subsList: Subscription[] = [];
  fromDate: any;
  toDate: any;
  branchId:any;
  accountGroupId:any;
  entriesStatusId:any;
  costCenterId:any;

  toolbarPathData: ToolbarPath = {
    listPath: '',
    addPath: '',
    updatePath: '',
    componentList:this.translate.instant("component-names.cost-centers-report"),
    componentAdd: ''
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
    private spinner: NgxSpinnerService,

  ) {
   
  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
   
   this.sharedServices.changeButton({ action: 'Report' } as ToolbarData);
   this.listenToClickedButton();
   this.sharedServices.changeToolbarPath(this.toolbarPathData);
   this.spinner.show();

   Promise.all([
    this.getGeneralConfigurationsOfAccountingPeriod()

  ]).then(a => {
    

    this.spinner.hide();
  }).catch(err => {
    
    this.spinner.hide();
  });
  }

  //#endregion
 //#region ngAfterViewInit
  ngAfterViewInit(): void {



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
      this.fromDate = this.dateConverterService.getCurrentDate();
      monthFrom = Number(this.fromDate.month + 1)
      this.fromDate = (this.fromDate.year+'-'+ monthFrom + "-" + this.fromDate.day).toString();
    }
    else
    {
      monthFrom = Number(this.fromDate.month + 1)
      this.fromDate = (this.fromDate.year+'-'+ monthFrom + "-" + this.fromDate.day).toString();

    }

    if (this.toDate == undefined || this.toDate == null) {
      this.toDate = this.dateConverterService.getCurrentDate();
      monthTo = Number(this.toDate.month + 1)
      this.toDate = (this.toDate.year+'-'+monthTo+ "-" + this.toDate.day).toString();

    }
    else
    {
      monthTo = Number(this.toDate.month + 1)
      this.toDate = (this.toDate.year+'-'+monthTo + "-" + this.toDate.day).toString();
    }
   


    if (this.branchId == null || this.branchId == undefined || this.branchId == "") {
      this.branchId = "";
    }
    if (this.entriesStatusId == null || this.entriesStatusId == undefined || this.entriesStatusId == "") {
      this.entriesStatusId = 0;
    }
    if (this.costCenterId == null || this.costCenterId == undefined || this.costCenterId == "") {
      this.costCenterId = 0;
    }
  
   
    
    let reportParams: string =
      "reportParameter=fromDate!" + this.fromDate +
      "&reportParameter=toDate!" + this.toDate + 
      "&reportParameter=branchId!" + this.branchId+
      "&reportParameter=companyId!" + this.companyId+
      "&reportParameter=entriesStatusId!" + this.entriesStatusId+
      "&reportParameter=costCenterId!" + this.costCenterId+
      "&reportParameter=lang!" + this.lang; 

    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.reportParams = reportParams;
    modalRef.componentInstance.reportType = 1;
    modalRef.componentInstance.reportTypeID = 5;

  }
  cancelDefaultReportStatus() {
    this.reportService.cancelDefaultReport(1,5).subscribe(resonse => {

    });
  }
  ShowOptions: {
     ShowFromDate: boolean, ShowToDate: boolean
    ShowSearch: boolean,ShowBranch:boolean
     , ShowEntriesStatus: boolean,ShowCostCenter:boolean
  } = {
    ShowFromDate: true, ShowToDate: true,
    ShowSearch: false,
    ShowBranch:true,
    ShowEntriesStatus:true,
    ShowCostCenter:true
 
  }

  OnFilter(e: {
    fromDate, toDate,branchId,entriesStatusId,costCenterId
  }) {
    
      this.fromDate = e.fromDate
      this.toDate = e.toDate
      this.branchId=e.branchId
      this.entriesStatusId=e.entriesStatusId
      this.costCenterId=e.costCenterId

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
  getGeneralConfigurationsOfAccountingPeriod() {
    
    return new Promise<void>((resolve, reject) => {
      
     let sub = this.generalConfigurationService.getGeneralConfiguration(7).subscribe({
        next: (res: any) => {
          resolve();
          console.log('result data getbyid', res);
          if (res.response.value > 0) {
            
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
      this.subsList.push(sub);

    });

  }
  getfiscalPeriodById(id: any) {
    return new Promise<void>((resolve, reject) => {
    let sub =  this.fiscalPeriodService.getFiscalPeriod(id).subscribe({
        next: (res: any) => {
          resolve();
          this.fromDate=this.dateConverterService.getDateForCalender(res.response.fromDate);
          this.toDate=this.dateConverterService.getDateForCalender(res.response.toDate);

      

        
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

}
