import { NgxSpinnerService } from 'ngx-spinner';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ReportServiceProxy } from 'src/app/shared/common-services/report.service';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { NgbdModalContent } from 'src/app/shared/components/modal/modal-component';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { DateConverterService } from 'src/app/shared/services/date-services/date-converter.service';
import { FiscalPeriodServiceProxy } from '../../services/fiscal-period.services';
import { GeneralConfigurationServiceProxy } from '../../services/general-configurations.services';
import { GeneralConfigurationEnum } from 'src/app/shared/constants/enumrators/enums';

@Component({
	selector: 'app-accounts-balance-report',
	templateUrl: './accounts-balance-report.component.html',
	styleUrls: ['./accounts-balance-report.component.scss']
})
export class AccountsBalanceReportComponent implements OnInit, OnDestroy, AfterViewInit {
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
	accountGroupId: any;
	parentAccountId: any;
	branchId: any;
	entriesStatusId: any;
	fromEntryNo: any = "";
	toEntryNo: any = "";
	JournalId: any;
	toolbarPathData: ToolbarPath = {
		listPath: "",
		addPath: "",
		updatePath: "",
		componentList: this.translate.instant("component-names.accounts-balance-report"),
		componentAdd: "",
	};

	//#region Constructor
	constructor(private modalService: NgbModal,
		private spinner: NgxSpinnerService,
		private reportService: ReportServiceProxy, private sharedServices: SharedService, private dateConverterService: DateConverterService, private translate: TranslateService, private generalConfigurationService: GeneralConfigurationServiceProxy, private fiscalPeriodService: FiscalPeriodServiceProxy) { }

	//#endregion

	//#region ngOnInit
	ngOnInit(): void {
		this.sharedServices.changeButton({ action: "Report" } as ToolbarData);
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
		//	this.getGeneralConfigurationsOfAccountingPeriod();
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

	selectedCurrencyName: any = '';
	selectedEntriesStatusName = '';
	selectedBranchName = ''
	selectedLeafAccountName = ''
	selectedMainAccountName = ''
	selectedAccountGroupName = ''
	gotoViewer() {

		let monthFrom;
		let monthTo;

		debugger;

		if (this.fromDate == undefined || this.fromDate == null) {
			//  this.fromDate = this.dateConverterService.getCurrentDate();
			monthFrom = Number(this.fromDate.month + 1)
			this.fromDate = (this.fromDate.year + '-' + monthFrom + "-" + this.fromDate.day).toString();
		}
		else if (this.fromDate.month != undefined) {

			monthFrom = Number(this.fromDate.month + 1)
			this.fromDate = (this.fromDate.year + '-' + monthFrom + "-" + this.fromDate.day).toString();
		}

		if (this.toDate == undefined || this.toDate == null) {

			monthTo = Number(this.toDate.month + 1)
			this.toDate = (this.toDate.year + '-' + monthTo + "-" + this.toDate.day).toString();

		}
		else if (this.toDate.month != undefined) {
			monthTo = Number(this.toDate.month + 1)
			this.toDate = (this.toDate.year + '-' + monthTo + "-" + this.toDate.day).toString();
		}


		if (this.branchId == null || this.branchId == undefined || this.branchId == "") {
			this.branchId = 0;
		}
		if (this.currencyId == null || this.currencyId == undefined || this.currencyId == "") {
			this.currencyId = 0;
		}
		if (this.accountGroupId == null || this.accountGroupId == undefined || this.accountGroupId == "") {
			this.accountGroupId = 0;
		}
		if (this.entriesStatusId == null || this.entriesStatusId == undefined || this.entriesStatusId == "") {
			this.entriesStatusId = 0;
		}

		if (this.fromEntryNo == null || this.fromEntryNo == undefined || this.fromEntryNo == "") {
			this.fromEntryNo = "";
		}
		if (this.toEntryNo == null || this.toEntryNo == undefined || this.toEntryNo == "") {
			this.toEntryNo = "";
		}
		if (this.parentAccountId == null || this.parentAccountId == undefined || this.parentAccountId == "") {
			this.parentAccountId = 0;
		}

	
		let reportParams: string = "reportParameter=fromDate!" + this.fromDate
			+ "&reportParameter=toDate!" + this.toDate
			+ "&reportParameter=branchId!" + this.branchId
			+ "&reportParameter=currencyId!" + this.currencyId
			+ "&reportParameter=companyId!" + this.companyId
			+ "&reportParameter=parentAccountId!" + this.parentAccountId
			+ "&reportParameter=entriesStatusId!" + this.entriesStatusId
			+ "&reportParameter=accountGroupId!" + this.accountGroupId
			+ "&reportParameter=fromEntryNo!" + this.fromEntryNo
			+ "&reportParameter=toEntryNo!" + this.toEntryNo
			+ "&reportParameter=lang!" + this.lang
			+ "&reportParameter=userId!" + this.userId
			+ "&reportParameter=selectedEntriesStatusName!" + this.selectedEntriesStatusName
			+ "&reportParameter=selectedBranchName!" + this.selectedBranchName
			+ "&reportParameter=selectedCurrencyName!" + this.selectedCurrencyName
			+ "&reportParameter=selectedMainAccountName!" + this.selectedMainAccountName
			+ "&reportParameter=selectedAccountGroupName!" + this.selectedAccountGroupName

		const modalRef = this.modalService.open(NgbdModalContent);
		modalRef.componentInstance.reportParams = reportParams;
		modalRef.componentInstance.reportType = 1;
		modalRef.componentInstance.reportTypeID = 7;
	}
	cancelDefaultReportStatus() {
		this.reportService.cancelDefaultReport(1, 7).subscribe((resonse) => { });
	}
	ShowOptions: {
		ShowFromDate: boolean;
		ShowToDate: boolean;
		ShowSearch: boolean;
		ShowCurrency: boolean;
		ShowBranch: boolean;
		ShowEntriesStatus: boolean;
		ShowFromEntryNo: boolean;
		ShowAccountGroup: boolean;
		ShowToEntryNo: boolean;
		ShowMainAccount: boolean;
	} = {
			ShowFromDate: true,
			ShowToDate: true,
			ShowSearch: false,
			ShowAccountGroup: true,
			ShowMainAccount: true,
			ShowCurrency: true,
			ShowBranch: true,
			ShowEntriesStatus: true,
			ShowFromEntryNo: true,
			ShowToEntryNo: true,
		};

	OnFilter(e: { fromDate; toDate; currencyId; currencyName; branchId; branchName; fromEntryNo; toEntryNo; entriesStatusId; entriesStatusName; mainAccountId; mainAccountName; accountGroupName, accountGroupId }) {
		this.fromDate = e.fromDate;
		this.toDate = e.toDate;
		this.fromEntryNo = e.fromEntryNo;
		this.toEntryNo = e.toEntryNo;
		this.currencyId = e.currencyId;
		this.branchId = e.branchId;
		this.entriesStatusId = e.entriesStatusId;
		this.parentAccountId = e.mainAccountId;
		this.accountGroupId = e.accountGroupId;
		this.selectedAccountGroupName = e.accountGroupName;
		this.selectedMainAccountName = e.mainAccountName;
		this.selectedCurrencyName = e.currencyName;
		this.selectedEntriesStatusName = e.entriesStatusName;
		this.selectedBranchName = e.branchName;

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

		const promise = new Promise<void>((resolve, reject) => {

			let sub = this.generalConfigurationService.getGeneralConfiguration(GeneralConfigurationEnum.AccountingPeriod).subscribe({
				next: (res: any) => {


					if (res.response.value > 0) {

						this.facialPeriodId = res.response.value;
						this.getfiscalPeriodById(this.facialPeriodId);
					}
				},
				error: (err: any) => {
					reject(err);
				},
				complete: () => {
					console.log("complete");
				},
			});
			this.subsList.push(sub);

		});

	}
	getfiscalPeriodById(id: any) {
		return new Promise<void>((resolve, reject) => {
			let sub = this.fiscalPeriodService.getFiscalPeriod(id).subscribe({
				next: (res: any) => {
					;
					console.log("result data getbyid", res);
					this.fromDate = this.dateConverterService.getDateForCalender(res.response.fromDate);
					this.toDate = this.dateConverterService.getDateForCalender(res.response.toDate);
				},
				error: (err: any) => {
					reject(err);
				},
				complete: () => {
					console.log("complete");
				},
			});
			this.subsList.push(sub);

		});
	}
}
