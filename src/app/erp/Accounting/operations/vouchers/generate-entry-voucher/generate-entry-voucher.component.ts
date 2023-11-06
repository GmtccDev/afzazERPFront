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
import { GeneralConfigurationEnum } from 'src/app/shared/constants/enumrators/enums';
import { FiscalPeriodStatus } from 'src/app/shared/enum/fiscal-period-status';

@Component({
	selector: 'app-generate-entry-voucher',
	templateUrl: './generate-entry-voucher.component.html',
	styleUrls: ['./generate-entry-voucher.component.scss']
})
export class GenerateEntryVoucherComponent implements OnInit, OnDestroy, AfterViewInit {
	//#region Main Declarations
	noGenerateEntryVouchers: any[] = [];
	voucherTypeId: any;
	fiscalPeriodId: number;
	fiscalPeriodName: string;
	fiscalPeriodStatus: number;
	errorMessage = '';
	errorClass = '';
	addUrl: string = '';
	updateUrl: string = '';
	listUrl: string = '/accounting-operations/generateEntryVoucher/';
	toolbarPathData: ToolbarPath = {
		listPath: '',
		updatePath: this.updateUrl,
		addPath: this.addUrl,
		componentList: this.translate.instant("component-names.generate-entry-vouchers"),
		componentAdd: '',

	};
	listIds: any[] = [];

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


	) {

	}


	//#endregion

	//#region ngOnInit
	ngOnInit(): void {
		this.spinner.show();
		Promise.all([this.getGeneralConfigurationsOfFiscalPeriod(), this.getNotGenerateEntryVouchers()])
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
					  
					this.fiscalPeriodName = this.lang == 'ar' ? res.response?.nameAr : res.response?.nameEn
					this.fiscalPeriodStatus = res.response?.fiscalPeriodStatus.toString()

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
						this.noGenerateEntryVouchers = res.response.data.result

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
					this.voucherTypeId = res.response?.voucherTypeId
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

					});
				this.subsList.push(sub);
				this.spinner.hide();

			}
		});
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
			field: 'voucherDate', width: 300, formatter: function (cell, formatterParams, onRendered) {
				var value = cell.getValue();
				value = format(new Date(value), 'dd-MM-yyyy');;
				return value;
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
		this.lang == "ar" ? {
			title: "توليد القيد",
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
		} :
			{
				title: "Generate Entry",
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
				},
			},

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
				,
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

	//#endregion
}
