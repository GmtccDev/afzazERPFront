import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { Subscription } from 'rxjs';
import { ITabulatorActionsSelected } from '../../../../../shared/interfaces/ITabulator-action-selected';
import { SettingMenuShowOptions } from 'src/app/shared/components/models/setting-menu-show-options';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { JournalEntryServiceProxy } from '../../../services/journal-entry'
import format from 'date-fns/format';
import { NgxSpinnerService } from 'ngx-spinner';
import { DateModel } from 'src/app/shared/model/date-model';
import { DateCalculation } from 'src/app/shared/services/date-services/date-calc.service';
import { EntryTypesArEnum, EntryTypesEnum, convertEnumToArray } from 'src/app/shared/constants/enumrators/enums';
import { GeneralConfigurationEnum } from 'src/app/shared/constants/enumrators/enums';
import { FiscalPeriodServiceProxy } from '../../../services/fiscal-period.services';
import { GeneralConfigurationServiceProxy } from '../../../services/general-configurations.services';
import { CompanyServiceProxy } from 'src/app/erp/master-codes/services/company.service';
import { UserService } from 'src/app/shared/common-services/user.service';
import { stringIsNullOrEmpty } from 'src/app/shared/helper/helper';
import { ICustomEnum } from 'src/app/shared/interfaces/ICustom-enum';
@Component({
	selector: 'app-journal-entry-post',
	templateUrl: './journal-entry-post.component.html',
	styleUrls: ['./journal-entry-post.component.scss']
})
export class JournalEntryPostComponent implements OnInit, OnDestroy, AfterViewInit {

	//#region Main Declarations
	journalEntry: any[] = [];
	currnetUrl: any;
	addUrl: string = '/accounting-operations/journalEntryPost/add-journalEntryPost';
	updateUrl: string = '/accounting-operations/journalEntryPost/update-journalEntryPost/';
	listUrl: string = '/accounting-operations/journalEntryPost';
	toolbarPathData: ToolbarPath = {
		listPath: '',
		updatePath: this.updateUrl,
		addPath: '',
		componentList: this.translate.instant("component-names.journalEntryPost"),
		componentAdd: '',

	};
	listIds: any[] = [];
	fiscalPeriodId: any;
	dateType: any;
	companyId: string = this.userService.getCompanyId();
	entryType: any;
	entryTypesEnum: ICustomEnum[] = [];

	//#endregion

	//#region Constructor
	constructor(
		private journalEntryService: JournalEntryServiceProxy,
		private router: Router,
		private sharedServices: SharedService,
		private translate: TranslateService,
		private spinner: NgxSpinnerService,
		private dateService: DateCalculation,
		private generalConfigurationService: GeneralConfigurationServiceProxy,
		private fiscalPeriodService: FiscalPeriodServiceProxy,
		private companyService: CompanyServiceProxy,
		private userService: UserService,
	) {

	}


	//#endregion

	//#region ngOnInit
	ngOnInit(): void {
		this.spinner.show();
		this.getEntryTypes();
		Promise.all([this.getCompanyById(this.companyId),this.getGeneralConfigurationsOfFiscalPeriod()
		,this.getJournalEntryes()])
			.then(a => {
				this.spinner.hide();
				this.sharedServices.changeButton({ action: 'Post' } as ToolbarData);
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
	filteredData = [];
	searchCode: any;
	searchFromDate!: DateModel;
	searchToDate!: DateModel;
	toggleButton: boolean = true;
	// Function to filter the data based on code and date
	filterData(code, entryType, fromDate, toDate) {
		this.filteredData = this.journalEntry;
		if (!stringIsNullOrEmpty(code)) {
			this.filteredData = this.filteredData.filter(item =>
				item.code === code
			);
		}
		if (!stringIsNullOrEmpty(entryType)) {
			if (entryType == EntryTypesEnum['Normal Entry']) {
				entryType = null;
			}
			this.filteredData = this.filteredData.filter(item =>
				item.parentType === entryType
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

		// let checkDate = this.dateService.getDateForInsert(selectedDate)
		// const date = new Date(checkDate);
		// this.searchFromDate = this.datePipe.transform(date, 'yyyy-MM-ddT00:00:00');

	}
	getToDate(selectedDate: DateModel) {
		this.searchToDate = selectedDate;

		// let checkDate = this.dateService.getDateForInsert(selectedDate)
		// const date = new Date(checkDate);
		// this.searchToDate = this.datePipe.transform(date, 'yyyy-MM-ddT00:00:00');

	}
	getJournalEntryes() {
		return new Promise<void>((resolve, reject) => {
			let sub = this.journalEntryService.allJournalEntryes(undefined, undefined, undefined, undefined, undefined).subscribe({
				next: (res) => {
					this.toolbarPathData.componentList = this.translate.instant("component-names.journalEntryPost");
					if (res.success) {

						this.journalEntry = res.response.data.result;
						this.filteredData = this.journalEntry;
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

	//#region CRUD operations
	delete(id: any) {
		this.journalEntryService.deleteJournalEntry(id).subscribe((resonse) => {
			this.getJournalEntryes();
		});
	}
	edit(id: string) {
		this.router.navigate([
			'/accounting-operations/journalEntryPost/update-journalEntryPost',
			id,
		]);
	}

	//#endregion



	showConfirmDeleteMessage(id) {

	}
	//#endregion
	//#region Tabulator

	panelId: number = 1;
	sortByCols: any[] = [];
	searchFilters: any;
	groupByCols: string[] = [];
	lang: string = localStorage.getItem("language");
	columnNames = [

		{
			title: this.lang == 'ar' ? ' الكود' : 'code ',
			field: 'code',
		},
		{
			title: this.lang == 'ar' ? ' تاريخ' : 'date ',
			field: 'date', formatter: (cell, formatterParams, onRendered) => {

				if (this.dateType == 2) {
					return this.dateService.getHijriDate(new Date(cell.getValue()));
				}
				else {
					return format(new Date(cell.getValue()), 'dd-MM-yyyy')

				}
			}
		},
		this.lang == 'ar'
			? { title: ' اسم اليومية', field: 'journalNameAr' } : { title: 'Journal Name ', field: 'journalNameEn' },


		this.lang == 'ar'
			? {
				title: '  الحالة  ', width: 300, field: 'statusAr'
				//, formatter: this.translateArEnum
			} : {
				title: '   Status', width: 300, field: 'statusEn'
				//, formatter: this.translateEnEnum
			},
		this.lang == 'ar'
			? {
				title: 'نوع المرجع', width: 300, field: 'settingAr'
			} : {
				title: 'Reference Type', width: 300, field: 'settingEn'
			},
		this.lang == 'ar'
			? {
				title: 'المرجع', width: 300, field: 'entryTypeAr'
				, formatter: this.hyperLinkType

				, cellClick: (e, cell) => {

					this.onViewClicked(cell.getRow().getData().parentType, cell.getRow().getData().parentTypeId, cell.getRow().getData().settingId);
				}
			} : {
				title: 'Reference', width: 300, field: 'entryTypeEn'
				, formatter: this.hyperLinkType
				, cellClick: (e, cell) => {

					this.onViewClicked(cell.getRow().getData().parentType, cell.getRow().getData().parentTypeId, cell.getRow().getData().settingId);
				}
			},
		{
			title: this.lang == 'ar' ? ' رقم المرجع' : 'Reference Number',
			field: 'parentTypeCode',
		},



	];

	menuOptions: SettingMenuShowOptions = {
		showDelete: false,
		showEdit: true,
	};

	direction: string = 'ltr';

	onSearchTextChange(searchTxt: string) {
		this.searchFilters = [
			[
				{ field: 'nameEn', type: 'like', value: searchTxt },
				{ field: 'nameAr', type: 'like', value: searchTxt },
				{ field: 'code', type: 'like', value: searchTxt },
				,
			],
		];
	}

	openJournalEntryes() { }
	onCheck(id) {
		const index = this.listIds.findIndex(item => item.id === id && item.isChecked === true);
		if (index !== -1) {
			this.listIds.splice(index, 1);
		} else {
			const newItem = { id, isChecked: true };
			this.listIds.push(newItem);
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
			this.router.navigate(['accounting-operations/journalEntryPost/update-journalEntryPost/' + id])
		}

	}
	onMenuActionSelected(event: ITabulatorActionsSelected) {

		if (event != null) {
			if (event.actionName == 'Edit') {
				this.edit(event.item.id);
				this.sharedServices.changeButton({
					action: 'Update',
					componentName: 'List',
					submitMode: false
				} as ToolbarData);

				this.sharedServices.changeToolbarPath(this.toolbarPathData);
				this.router.navigate(['accounting-operations/journalEntryPost/update-journalEntryPost/' + event.item.id])

			} else if (event.actionName == 'Delete') {
			}
		}
	}

	//#endregion



	//#region Toolbar Service
	currentBtn!: string;
	subsList: Subscription[] = [];
	listenToClickedButton() {

		let sub = this.sharedServices.getClickedbutton().subscribe({
			next: (currentBtn: ToolbarData) => {

				//currentBtn;
				if (currentBtn != null) {
					if (currentBtn.action == ToolbarActions.List) {

					} else if (currentBtn.action == ToolbarActions.New) {
						//  this.router.navigate([this.addUrl]);
					}
					else if (currentBtn.action == ToolbarActions.DeleteCheckList) {
						// this.onDelete();
					}
					else if (currentBtn.action == ToolbarActions.Post) {
						this.onCheckUpdate();
					}
				}
			},
		});
		this.subsList.push(sub);
	}
	onDelete() {
		var ids = this.listIds.map(item => item.id);
		let sub = this.journalEntryService.deleteListJournalEntry(ids).subscribe(
			(resonse) => {
				this.getJournalEntryes();
				this.listIds = [];
			});
		this.subsList.push(sub);
	}
	listUpdateIds: any[] = [];
	onCheckUpdate() {

		var ids = this.listIds.map(item => item.id);
		if (ids.length > 0) {
			let sub = this.journalEntryService.updateList(ids).subscribe(
				(resonse) => {
					this.getJournalEntryes();
					this.listUpdateIds = [];
					this.listIds = []
				});
			this.subsList.push(sub);
		}

	}
	hyperLinkType(cell, formatterParams, onRendered) {
		let text = cell.getValue();
		const iconHtml = `<span class="customLink px-3 b-r-3 bg-light-primary" >${text}</span>`;
		return iconHtml;
	}
	translateArEnum(cell, formatterParams, onRendered) {

		const status = cell.getValue();
		let text;
		switch (status) {
			case 1:
				text = 'مرحل';
				break;
			case 2:
				text = 'غير مرحل';
				break;

			default:
				text = 'غير مرحل';
				break;
		}
		return text;

	}
	translateEnEnum(cell, formatterParams, onRendered) {

		const status = cell.getValue();
		let text;
		switch (status) {
			case 1:
				text = 'Post';
				break;
			case 2:
				text = 'Not Post';
				break;

			default:
				text = 'Not Post';
				break;
		}
		return text;

	}
	translateParentArEnum(cell, formatterParams, onRendered) {

		const status = cell.getValue();
		let text;
		switch (status) {
			case 1:
				text = 'سندات';
				break;
			case 2:
				text = 'شيكات ورداة ';
				break;
			case 3:
				text = ' شيكات صادرة';
				break;
			default:
				text = '  قيد';
				break;
		}
		return text;

	}
	translateParentEnEnum(cell, formatterParams, onRendered) {

		const status = cell.getValue();
		let text;
		switch (status) {
			case 1:
				text = 'Voucher';
				break;
			case 2:
				text = 'Incoming Cheque';
				break;
			case 3:
				text = ' Issuing Cheque ';
				break;
			default:
				text = ' Journal Entry';
				break;
		}
		return text;

	}
	getEntryTypes() {
		if (this.lang == 'en') {
			this.entryTypesEnum = convertEnumToArray(EntryTypesEnum);
		}
		else {
			this.entryTypesEnum = convertEnumToArray(EntryTypesArEnum);

		}
	}
	CheckBoxFormatIcon() { //plain text value

		return "<input id='checkId' type='checkbox' />";
	};

	onViewClicked(parentType, id, settingId) {

		if (parentType == EntryTypesEnum.Voucher) {
			window.open('accounting-operations/vouchers/update-voucher/' + settingId + '/' + id, "")
		}
		if (parentType == EntryTypesEnum.RegisterIncomingCheque || parentType == EntryTypesEnum.CollectIncomingCheque
			|| parentType == EntryTypesEnum.RejectIncomingCheque
		) {
			window.open('accounting-operations/incomingCheque/update-incomingCheque/' + id, "_blank")
		}
		if (parentType == EntryTypesEnum.RegisterIssuingCheque || parentType == EntryTypesEnum.CollectIssuingCheque || parentType == EntryTypesEnum.RejectIssuingCheque) {
			window.open('accounting-operations/issuingCheque/update-issuingCheque/' + id, "_blank")
		}
		if (parentType == EntryTypesEnum.SalesBill || parentType == EntryTypesEnum.SalesReturnBill
			|| parentType == EntryTypesEnum.PurchasesBill || parentType == EntryTypesEnum.PurchasesReturnBill) {

			window.open('warehouses-operations/bill/update-bill/' + settingId + '/' + id, "_blank")
		}
	}
	//#endregion

	getGeneralConfigurationsOfFiscalPeriod() {
		return new Promise<void>((resolve, reject) => {
			let sub = this.generalConfigurationService.getGeneralConfiguration(GeneralConfigurationEnum.AccountingPeriod).subscribe({
				next: (res: any) => {
					resolve();

					if (res.response.value > 0) {
						this.fiscalPeriodId = res.response.value;
						if (this.fiscalPeriodId != null) {
							this.getfiscalPeriodById(this.fiscalPeriodId);

						}
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

					this.searchFromDate = this.dateService.getDateForCalender(res.response?.fromDate);
					this.searchToDate == this.dateService.getDateForCalender(res.response?.toDate);

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
