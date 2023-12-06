import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { VoucherServiceProxy } from '../../../services/voucher.service';
import { Router } from '@angular/router';
import { MessageModalComponent } from 'src/app/shared/components/message-modal/message-modal.component';
import { format } from 'date-fns';
import { GeneralConfigurationServiceProxy } from '../../../services/general-configurations.services';
import { FiscalPeriodServiceProxy } from '../../../services/fiscal-period.services';
import { NotificationsAlertsService } from 'src/app/shared/common-services/notifications-alerts.service';
import { GeneralConfigurationEnum, VoucherTypeArEnum, VoucherTypeEnum, convertEnumToArray } from 'src/app/shared/constants/enumrators/enums';
import { FiscalPeriodStatus } from 'src/app/shared/enum/fiscal-period-status';
import { UserService } from 'src/app/shared/common-services/user.service';
import { CompanyServiceProxy } from 'src/app/erp/master-codes/services/company.service';
import { DateCalculation, DateModel } from 'src/app/shared/services/date-services/date-calc.service';
import { stringIsNullOrEmpty } from 'src/app/shared/helper/helper';
import { ICustomEnum } from 'src/app/shared/interfaces/ICustom-enum';
import { VoucherDetail } from '../../../models/voucher';
import { AccountServiceProxy } from '../../../services/account.services';
import { PublicService } from 'src/app/shared/services/public.service';

@Component({
	selector: 'app-generate-entry-voucher',
	templateUrl: './generate-entry-voucher.component.html',
	styleUrls: ['./generate-entry-voucher.component.scss']
})
export class GenerateEntryVoucherComponent implements OnInit, OnDestroy, AfterViewInit {
	//#region Main Declarations
	generateEntryVouchers: any[] = [];
	voucherTypeId: any;
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
	voucherType: any;
	voucherTypesEnum: ICustomEnum[] = [];
	voucherTotalLocal: any;
	cashAccountId: any;
	accountsList: any;
	routeAccountApi = 'Account/GetLeafAccounts?'

	listUrl: string = '/accounting-operations/generateEntryVoucher/';
	toolbarPathData: ToolbarPath = {
		listPath: '',
		updatePath: this.updateUrl,
		addPath: this.addUrl,
		componentList: this.translate.instant("component-names.generate-entry-vouchers"),
		componentAdd: '',

	};
	balance: number = 0;

	listIds: any[] = [];
	dateType: any;
	companyId: string = this.userService.getCompanyId();
	voucherDetail: VoucherDetail[] = [];

	//#endregion

	//#region Constructor
	constructor(
		private voucherService: VoucherServiceProxy,
		private router: Router,
		private sharedServices: SharedService,
		private modalService: NgbModal,
		private translate: TranslateService,
		private spinner: NgxSpinnerService,
		private generalConfigurationService: GeneralConfigurationServiceProxy,
		private fiscalPeriodService: FiscalPeriodServiceProxy,
		private alertsService: NotificationsAlertsService,
		private userService: UserService,
		private companyService: CompanyServiceProxy,
		private dateService: DateCalculation,
		private accountService: AccountServiceProxy,
		private publicService: PublicService,


	) {

	}


	//#endregion

	//#region ngOnInit
	ngOnInit(): void {
		this.spinner.show();
		this.getVoucherTypes();
		Promise.all([this.getGeneralConfigurationsOfFiscalPeriod(), this.getCompanyById(this.companyId), this.getNotGenerateEntryVouchers(), this.getAccounts()])
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
	getVoucherTypes() {
		if (this.lang == 'en') {
			this.voucherTypesEnum = convertEnumToArray(VoucherTypeEnum);
		}
		else {
			this.voucherTypesEnum = convertEnumToArray(VoucherTypeArEnum);

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
	getfiscalPeriodById(id: any) {
		return new Promise<void>((resolve, reject) => {
			let sub = this.fiscalPeriodService.getFiscalPeriod(id).subscribe({
				next: (res: any) => {
					resolve();

					this.fiscalPeriodName = this.lang == 'ar' ? res.response?.nameAr : res.response?.nameEn;
					this.fiscalPeriodStatus = res.response?.fiscalPeriodStatus.toString();
					//this.searchFromDate = this.dateService.getDateForCalender(res.response?.fromDate);
					//this.searchToDate == this.dateService.getDateForCalender(res.response?.toDate);

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
	getAccounts() {
		return new Promise<void>((resolve, reject) => {
			let sub = this.publicService.getDdl(this.routeAccountApi).subscribe({
				next: (res) => {
					if (res.success) {
						
						this.accountsList = res.response;

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
	getNotGenerateEntryVouchers() {
		return new Promise<void>((resolve, reject) => {
			let sub = this.voucherService.allNotGenerateEntryVouchers(undefined, undefined, undefined, undefined, undefined).subscribe({
				next: (res) => {
					this.toolbarPathData.componentList = this.translate.instant("component-names.generate-entry-vouchers");

					if (res.success) {
						this.generateEntryVouchers = res.response.data.result
						this.filteredData = this.generateEntryVouchers;

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

	//#endregion

	//#region CRUD Operations

	edit(id: string) {
		this.getVoucherById(id).then(a => {
			this.router.navigate([
				'/accounting-operations/vouchers/update-voucher/',
				this.voucherTypeId, id,
			]);

			this.spinner.hide();

		}).catch(err => {
			this.spinner.hide();

		});

	}
	getVoucherById(id: any) {
		return new Promise<void>((resolve, reject) => {
			let sub = this.voucherService.getVoucher(id).subscribe({
				next: (res: any) => {
					resolve();
					this.voucherTypeId = res.response?.voucherTypeId;
					this.cashAccountId = res.response?.cashAccountId;
					this.voucherTotalLocal = res.response?.voucherTotalLocal;

					this.voucherDetail = res.response?.voucherDetail;

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
	getAccountBalance(id: any) {
		return new Promise<void>((resolve, reject) => {
			let sub = this.accountService.getAccountBalance(id).subscribe({
				next: (res: any) => {
					resolve();

					this.balance = res.response.data.result[0].balance;


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
	showConfirmGenerateEntryMessage(id) {
		
		this.getVoucherById(id).then(a => {
			
			var i = 0;
			if (this.voucherDetail != null) {
				
				this.voucherDetail.forEach(element => {
					
					if (element.beneficiaryId != null) {
						var value = 0;
						if (element.debitLocal > 0) {
							value = element.debitLocal;
						}
						if (element.creditLocal > 0) {
							value = element.creditLocal;

						}

						this.getAccountBalance(element.beneficiaryId).then(a => {
							
							var account = this.accountsList.find(x => x.id == element.beneficiaryId);

							var accountName = this.lang == 'ar' ? account.nameAr : account.nameEn;

							if (Number(this.balance) > 0 && account.debitLimit > 0) {

								if (Number(this.balance) + value > account.debitLimit) {


									this.errorMessage = this.translate.instant('general.debit-limit-exceed-account') + " : " + accountName + this.translate.instant('general.code') + " : " + account.code;
									this.errorClass = 'errorMessage';
									this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
									i++;
								}

							}
							else if (Number(this.balance) < 0 && account.creditLimit > 0) {

								if (-(this.balance) + value > account.creditLimit) {

									this.errorMessage = this.translate.instant('general.credit-limit-exceed-account') + " : " + accountName + this.translate.instant('general.code') + " : " + account.code;
									this.errorClass = 'errorMessage';
									this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
									i++;
								}
							}
						});
					}
				})

			}
			
			this.getAccountBalance(this.cashAccountId).then(a => {
				
				var account = this.accountsList.find(x => x.id == this.cashAccountId);

				var accountName = this.lang == 'ar' ? account.nameAr : account.nameEn;

				if (Number(this.balance) > 0 && account.debitLimit > 0) {

					if (Number(this.balance) + this.voucherTotalLocal > account.debitLimit) {


						this.errorMessage = this.translate.instant('general.debit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('general.cash-account') + ")" + this.translate.instant('general.code') + " : " + account.code;
						this.errorClass = 'errorMessage';
						this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
						i++;
					}

				}
				else if (Number(this.balance) < 0 && account.creditLimit > 0) {

					if (-(this.balance) + this.voucherTotalLocal > account.creditLimit) {

						this.errorMessage = this.translate.instant('general.credit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('general.cash-account') + ")" + this.translate.instant('general.code') + " : " + account.code;
						this.errorClass = 'errorMessage';
						this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
						i++;
					}


				}


			});
			setTimeout(() => {
				if (i == 0) {
					const modalRef = this.modalService.open(MessageModalComponent);
					modalRef.componentInstance.message = this.translate.instant('voucher.confirm-generate-entry');
					modalRef.componentInstance.title = this.translate.instant('messageTitle.generate-entry');
					modalRef.componentInstance.btnConfirmTxt = this.translate.instant('messageTitle.generate-entry');
					modalRef.componentInstance.isYesNo = true;
					modalRef.result.then((rs) => {
						if (rs == 'Confirm') {
							this.spinner.show();
							this.listIds = [];
							const newItem = { id };
							this.listIds.push(newItem);
							var ids = this.listIds.map(item => item.id);

							let sub = this.voucherService.generateEntry(ids).subscribe(
								(resonse) => {
									this.getNotGenerateEntryVouchers();
									this.router.navigate([this.listUrl])
									this.listIds = [];
									this.alertsService.showSuccess(this.errorMessage, this.translate.instant("general.generate-success"));

								});
							this.subsList.push(sub);
							this.spinner.hide();

						}
					});
				}
			}, 1000);

			this.spinner.hide();

		}).catch(err => {
			this.spinner.hide();

		});

	}
	// Function to filter the data based on code and date
	filterData(code, voucherType, fromDate, toDate) {
		
		this.filteredData = this.generateEntryVouchers;
		if (!stringIsNullOrEmpty(code)) {
			this.filteredData = this.filteredData.filter(item =>
				item.code === code
			);
		}
		if (!stringIsNullOrEmpty(voucherType)) {

			this.filteredData = this.filteredData.filter(item =>
				item.voucherKindId === voucherType
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
			field: 'voucherDate', width: 300, formatter: (cell, formatterParams, onRendered) => {
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
				title: 'نمط السند', field: 'nameAr'
			} : {
				title: 'Voucher Type', field: 'nameEn'
			},

		this.lang == 'ar'
			? {
				title: 'نوع السند', field: 'voucherKindAr'
			} : {
				title: 'Voucher Kind', field: 'voucherKindEn'
			},
		{
			title: this.lang == 'ar' ? ' الأجمالى محلى' : 'Total Local',
			field: 'voucherTotalLocal'
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
				{ field: 'voucherKindAr', type: 'like', value: searchTxt },
				{ field: 'voucherKindEn', type: 'like', value: searchTxt },
				{ field: 'voucherTotalLocal', type: 'like', value: searchTxt },
				
			],
		];
	}

	onCheck(id) {
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
					if (currentBtn.action == ToolbarActions.GenerateEntry) {
						this.onCheckGenerateEntry();
					}
				}
			},
		});
		this.subsList.push(sub);
	}
	onCheckGenerateEntry() {

		var ids = this.listIds.map(item => item.id);
		if (ids.length > 0) {
			let sub = this.voucherService.generateEntry(ids).subscribe(
				(resonse) => {
					this.getNotGenerateEntryVouchers();
					this.listIds = []
				});
			this.subsList.push(sub);
		}

	}
	getCompanyById(id: any) {
		return new Promise<void>((resolve, reject) => {

			let sub = this.companyService.getCompany(id).subscribe({
				next: (res: any) => {
					;

					res?.response?.useHijri
					if (res?.response?.useHijri) {
						this.dateType = 2
					} else {
						this.dateType = 1
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



	//#endregion
}
