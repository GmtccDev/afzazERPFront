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

@Component({
  selector: 'app-income-statement-report',
  templateUrl: './income-statement-report.component.html',
  styleUrls: ['./income-statement-report.component.scss']
})
export class IncomeStatementReportComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  subsList: Subscription[] = [];
  fromDate: any;
  toDate: any;
  accountGroupId:any;
  mainAccountId:any;
  leafAccountId:any;
  costCenterId:any;
  entriesStatusId:any;
  level:any;

  toolbarPathData: ToolbarPath = {
    listPath: '',
    addPath: '',
    updatePath: '',
    componentList:this.translate.instant("component-names.income-statement-report"),
    componentAdd: ''
  };
 
  //#region Constructor
  constructor(
    private modalService: NgbModal,
    private reportService: ReportServiceProxy,
    private sharedServices: SharedService,
    private dateConverterService: DateConverterService,
    private translate: TranslateService

  ) {
   
  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
   
   this.sharedServices.changeButton({ action: 'Report' } as ToolbarData);
   this.listenToClickedButton();
   this.sharedServices.changeToolbarPath(this.toolbarPathData);
  
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
 
    debugger
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
    if (this.accountGroupId == null || this.accountGroupId == undefined) {
      this.accountGroupId = 0;
    }
    if (this.mainAccountId == null || this.mainAccountId == undefined) {
      this.mainAccountId = 0;
    }
    if (this.leafAccountId == null || this.leafAccountId == undefined) {
      this.leafAccountId = 0;
    }
    if (this.costCenterId == null || this.costCenterId == undefined) {
      this.costCenterId = 0;
    }
    if (this.entriesStatusId == null || this.entriesStatusId == undefined) {
      this.entriesStatusId = 0;
    }
    if (this.level == null || this.level == undefined) {
      this.level = 0;
    }
    let reportParams: string =
      "reportParameter=fromDate!" + this.fromDate +
      "&reportParameter=toDate!" + this.toDate +
      "&reportParameter=accountGroupId!" + this.accountGroupId +
      "&reportParameter=mainAccountId!" + this.mainAccountId +
      "&reportParameter=leafAccountId!" + this.leafAccountId +
      "&reportParameter=costCenterId!" + this.costCenterId +
      "&reportParameter=entriesStatusId!" + this.entriesStatusId +
      "&reportParameter=level!" + this.level 
    debugger
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.reportParams = reportParams;
    modalRef.componentInstance.reportType = 1;
    modalRef.componentInstance.reportTypeID = 2;

  }
  cancelDefaultReportStatus() {
    this.reportService.cancelDefaultReport(1,2).subscribe(resonse => {

    });
  }
  ShowOptions: {
     ShowFromDate: boolean, ShowToDate: boolean
    ShowSearch: boolean,ShowAccountGroup:boolean,ShowMainAccount:boolean,ShowLeafAccount:boolean,ShowCostCenter,ShowEntriesStatus,ShowLevel
  } = {
    ShowFromDate: true, ShowToDate: true,
    ShowSearch: false,
    ShowAccountGroup: true,
    ShowMainAccount:true,
    ShowLeafAccount:true,
    ShowCostCenter:true,
    ShowEntriesStatus:true,
    ShowLevel:true
  }

  OnFilter(e: {
    fromDate, toDate,accountGroupId,mainAccountId,leafAccountId,costCenterId,entriesStatusId,level
  }) {
  
    
      this.fromDate = e.fromDate,
      this.toDate = e.toDate,
      this.accountGroupId=e.accountGroupId
      this.mainAccountId=e.mainAccountId
      this.leafAccountId=e.leafAccountId
      this.costCenterId=e.costCenterId
      this.entriesStatusId=e.entriesStatusId
      this.level=e.level
  }

  listenToClickedButton() {
    
    let sub = this.sharedServices.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {
        currentBtn;
        if (currentBtn != null) {
          
          if (currentBtn.action == ToolbarActions.View) {
            this.gotoViewer();

          }
          else if (currentBtn.action == ToolbarActions.CancelDefaultReport) {
            debugger
            this.cancelDefaultReportStatus();
          }
          this.sharedServices.changeButton({ action: 'Report' } as ToolbarData);
        }
      },
    });
    this.subsList.push(sub);
  }

}
