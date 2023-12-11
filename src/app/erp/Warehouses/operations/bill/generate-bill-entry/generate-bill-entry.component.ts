import { NotGenerateEntryBillDto } from './../../../models/not-generate-entry-bill-dto';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { VoucherDetail } from 'src/app/erp/Accounting/models/voucher';
import { AccountServiceProxy } from 'src/app/erp/Accounting/services/account.services';
import { FiscalPeriodServiceProxy } from 'src/app/erp/Accounting/services/fiscal-period.services';
import { GeneralConfigurationServiceProxy } from 'src/app/erp/Accounting/services/general-configurations.services';
import { VoucherServiceProxy } from 'src/app/erp/Accounting/services/voucher.service';
import { CompanyServiceProxy } from 'src/app/erp/master-codes/services/company.service';
import { NotificationsAlertsService } from 'src/app/shared/common-services/notifications-alerts.service';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { UserService } from 'src/app/shared/common-services/user.service';
import { MessageModalComponent } from 'src/app/shared/components/message-modal/message-modal.component';
import { BillKindArEnum, BillKindEnum, GeneralConfigurationEnum, VoucherTypeArEnum, VoucherTypeEnum, convertEnumToArray } from 'src/app/shared/constants/enumrators/enums';
import { FiscalPeriodStatus } from 'src/app/shared/enum/fiscal-period-status';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { stringIsNullOrEmpty } from 'src/app/shared/helper/helper';
import { ICustomEnum } from 'src/app/shared/interfaces/ICustom-enum';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { DateModel } from 'src/app/shared/model/date-model';
import { DateCalculation } from 'src/app/shared/services/date-services/date-calc.service';
import { PublicService } from 'src/app/shared/services/public.service';
import { BillServiceProxy } from '../../../services/bill.service';

@Component({
	selector: 'app-generate-bill-entry',
	templateUrl: './generate-bill-entry.component.html',
	styleUrls: ['./generate-bill-entry.component.scss']
})
export class GenerateBillEntryComponent implements OnInit, OnDestroy, AfterViewInit {
	//#region Main Declarations
	billTypeId: any;
	fiscalPeriodId: number;
	fiscalPeriodName: string;
	fiscalPeriodStatus: number;
	errorMessage = '';
	errorClass = '';
	addUrl: string = '';
	updateUrl: string = '';
	filteredData = [];
	searchCode: any;
	searchFromDate!: DateModel;
	searchToDate!: DateModel;
	billType: any;
	billTypesEnum: ICustomEnum[] = [];


	notGenerateEntryBills: NotGenerateEntryBillDto[] = []


	listUrl: string = '/warehouses-operations/generate-entry-bills/';
	toolbarPathData: ToolbarPath = {
		listPath: '',
		updatePath: this.updateUrl,
		addPath: this.addUrl,
		componentList: this.translate.instant("component-names.generate-bills-entry"),
		componentAdd: '',
	};
	balance: number = 0;

	listIds: any[] = [];
	dateType: any;
	companyId: string = this.userService.getCompanyId();

	//#endregion

	//#region Constructor
	constructor(
		private router: Router,
		private sharedServices: SharedService,
		private modalService: NgbModal,
		private translate: TranslateService,
		private spinner: NgxSpinnerService,
		private generalConfigurationService: GeneralConfigurationServiceProxy,
		private fiscalPeriodService: FiscalPeriodServiceProxy,
		private alertsService: NotificationsAlertsService,
		private userService: UserService,
		private dateService: DateCalculation,
		private billService: BillServiceProxy,


	) {

	}


	//#endregion

	//#region ngOnInit
	ngOnInit(): void {
		this.spinner.show();
		this.getBillTypes();
		Promise.all([
			this.getGeneralConfigurationsOfFiscalPeriod(),
			this.getNotGeneratedEntryBills(),
		])
			.then(a => {
				this.spinner.hide();
				this.sharedServices.changeButton({ action: 'GenerateEntry' } as ToolbarData);
				this.sharedServices.changeToolbarPath(this.toolbarPathData);
				this.listenToClickedButton();
			}).catch(err => {
				this.spinner.hide();
			})
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

	//#region Authentications

	//#endregion

	//#region Permissions

	//#endregion

	//#region  State Management
	//#endregion

	//#region Basic Data
	///Geting form dropdown list data

	//#endregion
	getBillTypes() {
		if (this.lang == 'en') {
			this.billTypesEnum = convertEnumToArray(BillKindEnum);
		}
		else {
			this.billTypesEnum = convertEnumToArray(BillKindArEnum);

		}
	}
	getGeneralConfigurationsOfFiscalPeriod() {
		return new Promise<void>((resolve, reject) => {
			let sub = this.generalConfigurationService.getGeneralConfiguration(GeneralConfigurationEnum.AccountingPeriod).subscribe({
				next: (res: any) => {
					resolve();

					if (res.response.value > 0) {
						this.fiscalPeriodId = res.response.value;
						this.getfiscalPeriodById(this.fiscalPeriodId);
					}


				},
				error: (err: any) => {
					reject(err);
				},
				complete: () => {
				},
			});
			this.subsList.push(sub);

		});

	}

	getNotGeneratedEntryBills() {
		return new Promise<void>((resolve, reject) => {

			let sub = this.billService.getAllNotGeneratedEntryBills().subscribe({
				next: (res) => {
					if (res.success) {
						this.notGenerateEntryBills = res?.response?.data;
						this.filteredData = this.notGenerateEntryBills;

					}
					resolve();

				},
				error: (err: any) => {
					reject(err);
				},
				complete: () => {
				},
			});

			this.subsList.push(sub);
		});

	}

	getfiscalPeriodById(id: any) {
		return new Promise<void>((resolve, reject) => {
			let sub = this.fiscalPeriodService.getFiscalPeriod(id).subscribe({
				next: (res: any) => {
					resolve();
					this.fiscalPeriodName = this.lang == 'ar' ? res.response?.nameAr : res.response?.nameEn;
					this.fiscalPeriodStatus = res.response?.fiscalPeriodStatus.toString();
				},
				error: (err: any) => {
					reject(err);
				},
				complete: () => {
				},
			});
			this.subsList.push(sub);

		});
	}



	//#endregion

	//#region CRUD Operations

	edit(id: string) {
		this.getBillById(id).then(a => {
			this.router.navigate([
				'/warehouses-operations/bill/update-bill/',
				this.billTypeId, id,
			]);

			this.spinner.hide();

		}).catch(err => {
			this.spinner.hide();

		});

	}
	getBillById(id: any) {
		return new Promise<void>((resolve, reject) => {
			let sub = this.billService.getBill(id).subscribe({
				next: (res: any) => {
					resolve();
					this.billTypeId = res.response?.billTypeId;

				},
				error: (err: any) => {
					reject(err);
				},
				complete: () => {
				},
			});
			this.subsList.push(sub);

		});
	}
	//#endregion

	showConfirmGenerateEntryMessage(id) {
		setTimeout(() => {
			debugger
			const modalRef = this.modalService.open(MessageModalComponent);
			modalRef.componentInstance.message = this.translate.instant('bill.confirm-generate-entry');
			modalRef.componentInstance.title = this.translate.instant('messageTitle.generate-entry');
			modalRef.componentInstance.btnConfirmTxt = this.translate.instant('messageTitle.generate-entry');
			modalRef.componentInstance.isYesNo = true;
			debugger
			modalRef.result.then((rs) => {
				if (rs == 'Confirm') {
					debugger
					this.spinner.show();
					this.listIds = [];
					const newItem = { id };
					this.listIds.push(newItem);
					var ids = this.listIds.map(item => item.id)
					let sub = this.billService.generateEntry(ids).subscribe(
						(resonse) => {
							this.getNotGeneratedEntryBills();
							this.router.navigate([this.listUrl])
							this.listIds = [];
							this.alertsService.showSuccess(this.errorMessage, this.translate.instant("general.generate-success"))
						});
					this.subsList.push(sub);
					this.spinner.hide();

				}
			});

		}, 1000);
	}

	// Function to filter the data based on code and date
	filterData(code, billType, fromDate, toDate) {

		this.filteredData = this.notGenerateEntryBills;
		if (!stringIsNullOrEmpty(code)) {
			this.filteredData = this.filteredData.filter(item =>
				item.code === code
			);
		}
		if (!stringIsNullOrEmpty(billType)) {

			this.filteredData = this.filteredData.filter(item =>
				item.billKindId === billType
			);
		}
		if (!stringIsNullOrEmpty(fromDate)) {

			this.filteredData = this.filteredData.filter(item =>

				item.date >= (fromDate)
			);
			if (!stringIsNullOrEmpty(toDate)) {

				this.filteredData = this.filteredData.filter(item =>

					(item.date) <= (toDate)
				);
			}
		}
	}
	getFromDate(selectedDate: DateModel) {
		this.searchFromDate = selectedDate;

	}
	getToDate(selectedDate: DateModel) {
		this.searchToDate = selectedDate;

	}
	editFormatIcon() { //plain text value
		return "<i class=' fa fa-edit'></i>";
	};
	//#endregion
	//#region Tabulator

	panelId: number = 1;
	sortByCols: any[] = [];
	searchFilters: any;
	groupByCols: string[] = [];
	lang: string = localStorage.getItem("language");
	direction: string = 'ltr';

	columnNames = [
		{
			title: this.lang == 'ar' ? ' كود' : 'Code ',
			field: 'code',
		},
		{
			title: this.lang == 'ar' ? ' تاريخ' : 'Date ',
			field: 'billDate', width: 300, formatter: (cell, formatterParams, onRendered) => {
				if (this.dateType == 2) {
					return this.dateService.getHijriDate(new Date(cell.getValue()));
				}
				else {
					return format(new Date(cell.getValue()), 'dd-MM-yyyy')

				}
			}

		},
		this.lang == 'ar'
			? {
				title: 'نمط الفاتورة', field: 'billTypeAr'
			} : {
				title: 'Bill Type', field: 'billTypeEn'
			},

		this.lang == 'ar'
			? {
				title: 'نوع الفاتورة', field: 'billKindAr'
			} : {
				title: 'Bill Kind', field: 'billKindEn'
			},
		{
			title: this.lang == 'ar' ? ' الأجمالى محلى' : 'Total Local',
			field: 'totalBeforeTax'
		},
		{
			title: this.lang == "ar" ? "توليد القيد" : "Generate Entry",
			field: "", formatter: this.editFormatIcon, cellClick: (e, cell) => {
				if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
					this.errorMessage = this.translate.instant("voucher.no-generate-entry-voucher-fiscal-period-closed") + " : " + this.fiscalPeriodName;
					this.errorClass = 'errorMessage';
					this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
					return;
				}
				else {
					this.showConfirmGenerateEntryMessage(cell.getRow().getData().id);

				}
			}
		}


	];


	onSearchTextChange(searchTxt: string) {
		this.searchFilters = [
			[
				{ field: 'code', type: 'like', value: searchTxt },
				{ field: 'nameAr', type: 'like', value: searchTxt },
				{ field: 'nameEn', type: 'like', value: searchTxt },
				{ field: 'billDate', type: 'like', value: searchTxt },
				{ field: 'billTypeAr', type: 'like', value: searchTxt },
				{ field: 'billTypeEn', type: 'like', value: searchTxt },
				{ field: 'billKindAr', type: 'like', value: searchTxt },
				{ field: 'billKindEn', type: 'like', value: searchTxt },
				{ field: 'totalBeforeTax', type: 'like', value: searchTxt },
			],
		];
	}
	isCheckItme: boolean = false;
	onCheck(id) {
		debugger;
		this.isCheckItme = true;
		if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
			this.errorMessage = this.translate.instant("voucher.no-generate-entry-voucher-fiscal-period-closed") + " : " + this.fiscalPeriodName;
			this.errorClass = 'errorMessage';
			this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
			return;
		}
		else {
			const index = this.listIds.findIndex(item => item.id === id && item.isChecked === true);
			if (index !== -1) {
				this.listIds.splice(index, 1);
			} else {
				const newItem = { id, isChecked: true };
				this.listIds.push(newItem);
			}
		}

	}
	onEdit(id) {
		if (id != undefined) {
			this.edit(id);
			this.sharedServices.changeButton({
				action: 'Update',
				componentName: 'List',
				submitMode: false
			} as ToolbarData);

			this.sharedServices.changeToolbarPath(this.toolbarPathData);

		}

	}


	//#endregion

	//#region Toolbar Service
	currentBtn!: string;
	subsList: Subscription[] = [];
	listenToClickedButton() {
		let sub = this.sharedServices.getClickedbutton().subscribe({
			next: (currentBtn: ToolbarData) => {
				if (currentBtn != null) {
					if (currentBtn.action == ToolbarActions.GenerateEntry && currentBtn.submitMode) {
						if (this.isCheckItme) {
							this.onCheckGenerateEntry();
						} else {
							this.alertsService.showError(this.translate.instant("bill.check-bill-item"), this.translate.instant("message-title.wrong"));

						}

					}
				}
			},
		});
		this.subsList.push(sub);
	}
	onCheckGenerateEntry() {
		var ids = this.listIds.map(item => item.id);
		if (ids.length > 0) {
			let sub = this.billService.generateEntry(ids).subscribe(
				(resonse) => {
					this.getNotGeneratedEntryBills();
					this.listIds = [];
					this.alertsService.showSuccess(this.errorMessage, this.translate.instant("general.generate-success"))

				});
			this.subsList.push(sub);
		}
	}



	//#endregion
}