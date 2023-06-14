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
  selector: 'app-analytical-budget-report',
  templateUrl: './analytical-budget-report.component.html',
  styleUrls: ['./analytical-budget-report.component.scss']
})
export class AnalyticalBudgetReportComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  subsList: Subscription[] = [];
  fromDate: any;
  toDate: any;
  entriesStatusId:any;
  level:any;
  toolbarPathData: ToolbarPath = {
    listPath: '',
    addPath: '',
    updatePath: '',
    componentList: this.translate.instant("component-names.analytical-budget-report"),
    componentAdd: '',
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
   debugger
   
   this.sharedServices.changeButton({ action: 'Report' } as ToolbarData);
   this.listenToClickedButton();
   this.sharedServices.changeToolbarPath(this.toolbarPathData);

  }

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
    if (this.entriesStatusId == null || this.entriesStatusId == undefined) {
      this.entriesStatusId = 0;
    }
    if (this.level == null || this.level == undefined) {
      this.level = 0;
    }
    let reportParams: string =
      "reportParameter=fromDate!" + this.fromDate +
      "&reportParameter=toDate!" + this.toDate+
      "&reportParameter=entriesStatusId!" + this.entriesStatusId +
      "&reportParameter=level!" + this.level 

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
    ShowSearch: boolean,ShowEntriesStatus:boolean,ShowLevel:boolean
  } = {
      
      ShowFromDate: true, ShowToDate: true
      , ShowSearch: false,ShowEntriesStatus:true,ShowLevel:true
      
    }

  OnFilter(e: {
    fromDate, toDate,entriesStatusId,level
  }) {
    debugger
    
      this.fromDate = e.fromDate,
      this.toDate = e.toDate,
      this.entriesStatusId=e.entriesStatusId,
      this.level=e.level 

  }

  listenToClickedButton() {
    let sub = this.sharedServices.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {
        currentBtn;
        if (currentBtn != null) {
          debugger
          if (currentBtn.action == ToolbarActions.View) {
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
