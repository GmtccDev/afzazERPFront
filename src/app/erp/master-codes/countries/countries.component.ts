import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { CountryServiceProxy } from '../services/country.servies';
import { CountryDto, DeleteListCountryCommand } from '../models/country';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { Subscription } from 'rxjs';
import { ITabulatorActionsSelected } from '../../../shared/interfaces/ITabulator-action-selected';
import { MessageModalComponent } from '../../../shared/components/message-modal/message-modal.component'
import { SettingMenuShowOptions } from 'src/app/shared/components/models/setting-menu-show-options';
import { ToolbarActions } from '../../../shared/enum/toolbar-actions'
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
	selector: 'app-countries',
	templateUrl: './countries.component.html',
	styleUrls: ['./countries.component.css']
})
export class CountriesComponent implements OnInit, OnDestroy, AfterViewInit {

	//#region Main Declarations
	countries: CountryDto[] = [];
	currnetUrl: any;
	addUrl: string = '/master-codes/countries/add-country';
	updateUrl: string = '/master-codes/countries/update-country/';
	listUrl: string = '/master-codes/countries';
	toolbarPathData: ToolbarPath = {
		listPath: '',
		updatePath: this.updateUrl,
		addPath: this.addUrl,
		componentList: this.translate.instant("component-names.countries"),
		componentAdd: '',

	};
	listIds: any[] = [];
	//#endregion

	//#region Constructor
	constructor(
		private countryService: CountryServiceProxy,
		private router: Router,
		private sharedServices: SharedService,
		private modalService: NgbModal,
		private translate: TranslateService,
		private spinner: NgxSpinnerService,

	) {

	}


	//#endregion

	//#region ngOnInit
	ngOnInit(): void {
		// this.defineGridColumn();
		this.spinner.show();
		Promise.all([this.getCountries()])
			.then(a => {
				this.spinner.hide();
				this.sharedServices.changeButton({ action: 'List' } as ToolbarData);
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
	getCountries() {
		return new Promise<void>((resolve, reject) => {
			let sub = this.countryService.allCountries(undefined, undefined, undefined, undefined, undefined).subscribe({
				next: (res) => {

					this.toolbarPathData.componentList = this.translate.instant("component-names.countries");
					if (res.success) {
						this.countries = res.response.items


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

	//#region CRUD Operations
	delete(id: any) {
		this.countryService.deleteCountry(id).subscribe((resonse) => {
			this.getCountries();
		});
	}
	edit(id: string) {
		this.router.navigate([
			'/master-codes/countries/update-country',
			id,
		]);
	}

	//#endregion



	showConfirmDeleteMessage(id) {
		const modalRef = this.modalService.open(MessageModalComponent);
		modalRef.componentInstance.message = this.translate.instant('messages.confirm-delete');
		modalRef.componentInstance.title = this.translate.instant('messageTitle.delete');
		modalRef.componentInstance.btnConfirmTxt = this.translate.instant('messageTitle.delete');
		modalRef.componentInstance.isYesNo = true;
		modalRef.result.then((rs) => {
			//console.log(rs);
			if (rs == 'Confirm') {
				this.spinner.show();
				const input = {
					tableName: "Countries",
					id: id,
					idName: "Id"
				};
				let sub = this.countryService.deleteEntity(input).subscribe(
					(resonse) => {

						this.getCountries();

					});
				this.subsList.push(sub);
				this.spinner.hide();

			}
		});
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
		this.lang == 'ar'
			? { title: ' الاسم', field: 'nameAr' } :
			{ title: ' Name  ', field: 'nameEn' },



	];

	menuOptions: SettingMenuShowOptions = {
		showDelete: true,
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

	openCountries() { }
	onCheck(id) {

		  const index = this.listIds.findIndex(item => item.id === id && item.isChecked === true);
    if (index !== -1) {
      this.listIds.splice(index, 1);
    } else {
      const newItem = { id, isChecked: true };
      this.listIds.push(newItem);
    }
		this.sharedServices.changeButton({
			action: 'Delete',
			componentName: 'List',
			submitMode: false
		} as ToolbarData);
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
			this.router.navigate(['master-codes/countries/update-country/' + id])
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
				this.router.navigate(['master-codes/countries/update-country/' + event.item.id])

			} else if (event.actionName == 'Delete') {
				this.showConfirmDeleteMessage(event.item.id);
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
						this.router.navigate([this.addUrl]);
					}
					else if (currentBtn.action == ToolbarActions.DeleteCheckList) {
						this.onDelete();
					}
				}
			},
		});
		this.subsList.push(sub);
	}
	onDelete() {

		let item = new DeleteListCountryCommand();
		item.ids = this.listIds.map(item => item.id);
		const input = {
			tableName: "Countries",
			ids: item.ids,
			idName: "Id"
		};
		let sub = this.countryService.deleteListEntity(input).subscribe(
			(resonse) => {

				//reloadPage()
				this.getCountries();
				this.listIds = [];
			});
		this.subsList.push(sub);
	}
	//#endregion
}
