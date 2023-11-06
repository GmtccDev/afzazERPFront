import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ReportServiceProxy } from 'src/app/shared/common-services/report.service';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { DateConverterService } from 'src/app/shared/services/date-services/date-converter.service';
import { GeneralConfigurationServiceProxy } from '../../services/general-configurations.services';
import { FiscalPeriodServiceProxy } from '../../services/fiscal-period.services';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { NgbdModalContent } from 'src/app/shared/components/modal/modal-component';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { GeneralConfigurationEnum } from 'src/app/shared/constants/enumrators/enums';

@Component({
  selector: 'app-journal-entry-page-report',
  templateUrl: './journal-entry-page-report.component.html',
  styleUrls: ['./journal-entry-page-report.component.scss']
})
export class JournalEntryPageReportComponent implements OnInit, OnDestroy, AfterViewInit {
	//#region Main Declarations
	facialPeriodId: any;
	userId: any = localStorage.getItem("userId");
	orderBy: any;
	companyId: string = localStorage.getItem("companyId");
	lang = localStorage.getItem("language");

	subsList: Subscription[] = [];
	fromDate: any;
	toDate: any;
	currencyId: any;
	branchId: any;
	entriesStatusId: any;
	fromEntryNo: any = "";
	toEntryNo: any = "";
	JournalId: any;
	toolbarPathData: ToolbarPath = {
		listPath: "",
		addPath: "",
		updatePath: "",
		componentList: this.translate.instant("component-names.journal-entries-report"),
		componentAdd: "",
	};

	//#region Constructor
	constructor(private modalService: NgbModal,
		private spinner:NgxSpinnerService,
		 private reportService: ReportServiceProxy, private sharedServices: SharedService, private dateConverterService: DateConverterService, private translate: TranslateService, private generalConfigurationService: GeneralConfigurationServiceProxy, private fiscalPeriodService: FiscalPeriodServiceProxy) {}

	//#endregion

	//#region ngOnInit
	ngOnInit(): void {
		
		//this.sharedServices.changeButton({ action: "Report" } as ToolbarData);
		this.listenToClickedButton();
		this.sharedServices.changeToolbarPath(this.toolbarPathData);
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
		//this.getGeneralConfigurationsOfAccountingPeriod();
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
		//this.fromDate= this.dateConverterService.getDateForCalender(this.defualtFromDate);
		selectedCurrencyName:any='';
		selectedEntriesStatusName='';
		selectedBranchName=''
		selectedLeafAccountName=''

    reportTypeId=1000;
	gotoViewer() {
		
	

		if (this.branchId == null || this.branchId == undefined || this.branchId == "undefined"|| this.branchId == "") {
			this.branchId = 0;
		}
		

		if (this.fromEntryNo == null || this.fromEntryNo == undefined || this.fromEntryNo == "") {
			this.fromEntryNo = "";
		}
		if (this.toEntryNo == null || this.toEntryNo == undefined || this.toEntryNo == "") {
			this.toEntryNo = "";
		}
		if (this.currencyId == null || this.currencyId == undefined || this.currencyId == "") {
			this.currencyId = 0;
		}

		

		let reportParams: string = "reportParameter=branchId!" + this.branchId
		+ "&reportParameter=companyId!" + this.companyId
		+"&reportParameter=selectedBranchName!" + this.selectedBranchName
		+"&reportParameter=selectedCurrencyName!" + this.selectedCurrencyName 
		+ "&reportParameter=JournalId!" + this.JournalId
		+ "&reportParameter=lang!" + this.lang
		+ "&reportParameter=userId!" + this.userId;

		const modalRef = this.modalService.open(NgbdModalContent);
		modalRef.componentInstance.reportParams = reportParams;
		modalRef.componentInstance.reportType = 1;
		modalRef.componentInstance.reportTypeID = this.reportTypeId;
	}
	cancelDefaultReportStatus() {
		this.reportService.cancelDefaultReport(1, this.reportTypeId).subscribe((resonse) => {});
	}
	accountId
	ShowOptions: {
		ShowFromDate: boolean;
		ShowToDate: boolean;
		ShowSearch: boolean;
		ShowCurrency: boolean;
		ShowBranch: boolean;
		ShowEntriesStatus: boolean;
		ShowFromEntryNo: boolean;
		ShowToEntryNo: boolean;
		ShowLeafAccount:boolean;
	} = {
		ShowFromDate: true,
		ShowToDate: true,
		ShowSearch: false,
		ShowCurrency: true,
		ShowBranch: true,
		ShowEntriesStatus: true,
		ShowFromEntryNo: true,
		ShowToEntryNo: true,
		ShowLeafAccount:true
	};

	OnFilter(e: { branchName,currencyName,currencyId; branchId }) {
		

		this.currencyId = e.currencyId;
		this.branchId = e.branchId;
		this.selectedCurrencyName=e.currencyName,


		this.selectedBranchName = e.branchName
	}

	listenToClickedButton() {
		let sub = this.sharedServices.getClickedbutton().subscribe({
			next: (currentBtn: ToolbarData) => {
				currentBtn;
				if (currentBtn != null) {
					if (currentBtn.action == ToolbarActions.Print) {
						this.gotoViewer();
					} else if (currentBtn.action == ToolbarActions.CancelDefaultReport) {
						this.cancelDefaultReportStatus();
					}
					this.sharedServices.changeButton({ action: "Report" } as ToolbarData);
				}
			},
		});
		this.subsList.push(sub);
	}
	getGeneralConfigurationsOfAccountingPeriod() {
		;
		const promise = new Promise<void>((resolve, reject) => {
			;
			this.generalConfigurationService.getGeneralConfiguration(GeneralConfigurationEnum.AccountingPeriod).subscribe({
				next: (res: any) => {
					;
			
					if (res.response.value > 0) {
						
						this.facialPeriodId =Number(res.response.value);
						this.getfiscalPeriodById(this.facialPeriodId);
					}
				},
				error: (err: any) => {
					reject(err);
				},
				complete: () => {
					
				},
			});
		});
		return promise;
	}
	defualtFromDate:any;
	defualtToDate:any;
	getfiscalPeriodById(id: any) {
		const promise = new Promise<void>((resolve, reject) => {
			this.fiscalPeriodService.getFiscalPeriod(id).subscribe({
				next: (res: any) => {
					
				    this.defualtFromDate=res.response.fromDate;
					this.defualtToDate =res.response.toDate;
					this.fromDate = this.dateConverterService.getDateForCalender(res.response.fromDate);
					this.toDate = this.dateConverterService.getDateForCalender(res.response.toDate);
				},
				error: (err: any) => {
					reject(err);
				},
				complete: () => {
					
				},
			});
		});
		return promise;
	}

}
