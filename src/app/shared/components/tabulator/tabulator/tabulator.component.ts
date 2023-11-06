import {
	AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges,
	OnDestroy, OnInit, Output, Renderer2, SimpleChanges, ViewChild, AfterContentInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingMenuShowOptions } from '../../models/setting-menu-show-options';
import * as Tabulator from 'tabulator-tables/dist/js/tabulator';
import { PanelSetting } from '../../models/panel-setting';

@Component({
	selector: 'app-tabulator',
	templateUrl: './tabulator.component.html',
	styleUrls: ['./tabulator.component.scss']
})
export class TabulatorComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy, AfterContentInit {

	@Input() parentColName: string = "";
	@Input() idColName: string = "id";
	@Input() componentName: string = "";
	@Input() isModal: boolean = false;
	tabulatorStyle: string = "";
	@Output() onAddItem: EventEmitter<void> = new EventEmitter();
	@Output() onAddGroup: EventEmitter<void> = new EventEmitter();
	// @Input() showAddGroup:boolean = false;
	// @Input() showAddItem:boolean = false;
	@Output() onEditItem: EventEmitter<any> = new EventEmitter();
	@Output() onDeleteItem: EventEmitter<any> = new EventEmitter();
	@Output() onCheckItem: EventEmitter<any> = new EventEmitter();
	@Output() onCheckPost: EventEmitter<any> = new EventEmitter();
	@Output() onSelectItem: EventEmitter<{ item: any, isChecked: boolean }> = new EventEmitter();
	@Output() onMenuActionSelected: EventEmitter<{ item: any, componentName: string, actionName: string }> = new EventEmitter();
	@Input() showMenuOptions: SettingMenuShowOptions = {};
	@Input() panelId: number = 0;
	@Input() divId: string = "tabular";
	@Input() direction: string = "ltr";
	@Input() childRowData: any[] = [];
	tabular: any;
	@Input() groupByList: string[] = [];
	@Input() sortByList: any[] = [];
	subsList: Subscription[] = [];
	@Output() onItemDoubleClick: EventEmitter<any> = new EventEmitter();
	searchTxt: string = "";
	@Output() onSearchTextChange: EventEmitter<string> = new EventEmitter();
	@Input() searchFilters: any[] = [];
	@Output() onShowGridFilterChange: EventEmitter<{ componentName: string, show: boolean }> = new EventEmitter();
	isShowGridFilter: boolean = false;
	@Input() groupType: number = 0;
	@Input() path: string = "";
	@Input() showExport: boolean = true;

	filterOperations: { nameAr: string, nameEn: string, symbol: string }[] = [
		{
			nameAr: "يساوي",
			nameEn: "Equal",
			symbol: "=",
		}, {
			nameAr: "أصغر من",
			nameEn: "Smaller than",
			symbol: "<",
		}, {
			nameAr: "أصغر من او يساوي",
			nameEn: "Smaller than or equal",
			symbol: "<=",
		}, {
			nameAr: "أكبر من",
			nameEn: "Greater than",
			symbol: ">",
		}, {
			nameAr: "أكبر من او يساوي",
			nameEn: "Greater than or equal",
			symbol: ">=",
		},
		{
			nameAr: "لا يساوي",
			nameEn: "Not equal",
			symbol: "!=",
		}, {
			nameAr: "يحتوي",
			nameEn: "Like",
			symbol: "like"
		}
	];



	tab: any;
	@ViewChild("searchInput") searchInput?: ElementRef;
	@ViewChild("searchButton") searchButton?: ElementRef;

	@Input() decreaseHeight: string = '350';
	height: string = "100%"

	// customStyle: string = `padding-left: 5px; padding-top: 0px;
	// height: calc(100vh - ${this.decreaseHeight}px);
	// display: block;position: absolute;`;
	customStyle: string = `padding-left: 5px; padding-top: 0px;
	display: block;position: absolute;`;


	@Input() columnSettings: any[] = [];
	columnNames: any[] = [];

	constructor(private renderer: Renderer2) {
	}



	ngOnInit() {

		//this.listenToRedraw();
	}




	private drawTable() {
		;
		let self = this;
		this.tabular = new Tabulator(this.tab, {

			//columns: this.columnNames,'
			cellDblClick: (e: any, cell: any) => {

				this.onItemDoubleClick.emit(cell._cell.row.data);
			},
			//movableColumns: true,
			data: this.childRowData,
			height: this.height,
			virtualDomHoz: true,
			layout: "fitDataStretch",
			rowContextMenu: (row: any, e: any) => { return this.getContextMenu(row, e, this.showMenuOptions, this, this.componentName) },
			groupHeader: (value: any, count: any, data: any, group: any) => {
				return value + "<span style='color:#d00; margin-left:10px;'>(" + count + " item)</span>";
			},
			tooltips: (cell: any) => {
				return this.getToolTip(cell)
			},
			dataSorted: (sorters: any, rows: any) => {
				this.afterSort(sorters, rows)
			},
			//Local Pagination
			pagination: "local",
			paginationSize: 50,
			paginationSizeSelector: [5, 10, 20, 50, 100, 1000, 10000, 100000],

			//Remote Pagination
			//pagination:"remote", //enable remote pagination
			// ajaxURL: AppConfigService.settings.serverURL+"/"+this.path+"/GetAllForTabulator", //set url for ajax request
			// //ajaxParams:{token:localStorage.getItem(TOKEN_KEY)}, //set any standard parameters to pass with the request
			// paginationSize:100, //optional parameter to request a certain number of rows per page
			// paginationInitialPage:1, //optional parameter to set the initial page to load
			// paginationSizeSelector: [5, 10, 20, 50, 100, 500, 1000, 100000],


			//paginationCounter: "rows",


			selectable: true,

			// rowSelectionChanged: function (data: any, rows: any) {


			//   document.getElementById("deselect-all")!.addEventListener("click", function () {
			//     self.tabular.deselectRow();
			//   });

			//   document.getElementById("select-row")!.addEventListener("click", function(){
			//     self.tabular.selectRow(rows);
			// });

			// },



		});

		document.getElementById('my-tabular-table' + this.divId)?.appendChild(this.tab);


	}

	search() {

		this.onSearchTextChange.emit(this.searchTxt);
	}

	showSearch() {
		// this.renderer.setStyle(this.searchInput?.nativeElement, "position", "absolute");
		// this.renderer.setStyle(this.searchInput?.nativeElement, "width", "67%");
		// this.renderer.setStyle(this.searchInput?.nativeElement, "visibility", "visible");
		// this.renderer.setStyle(this.searchInput?.nativeElement, "background-image", "url(../../../assets/sniper/images/search_yellow.svg)");
		// this.renderer.setStyle(this.searchInput?.nativeElement, "background-repeat", "no-repeat");
		// this.renderer.setStyle(this.searchInput?.nativeElement, "background-position", "95% center");
		// this.renderer.setStyle(this.searchInput?.nativeElement, "cursor", "pointer");
		// this.renderer.setStyle(this.searchInput?.nativeElement, "z-index", "99");


		//================
		// visibility:hidden;
		// transition:0s;
		// this.renderer.setStyle(this.searchButton?.nativeElement, "visibility", "hidden");
		// this.renderer.setStyle(this.searchButton?.nativeElement, "transition", "0s");
		// this.renderer.setStyle(this.searchButton?.nativeElement, "display", "none");
		setTimeout(() => {
			this.searchInput?.nativeElement.focus();
		}, 500);
	}


	showGridFilter() {
		this.isShowGridFilter = !this.isShowGridFilter;
		this.onShowGridFilterChange.emit({
			componentName: this.componentName,
			show: this.isShowGridFilter
		})
	}




	showSearchButton() {

		// if (!this.searchTxt) {
		//   this.renderer.setStyle(this.searchInput?.nativeElement, "width", "0px");
		//   this.renderer.setStyle(this.searchButton?.nativeElement, "visibility", "visible");
		//   this.renderer.setStyle(this.searchButton?.nativeElement, "display", "block");
		// }
	}




	ngAfterViewInit() {
		;
		this.tab = document.createElement('div');
		this.drawTable();
		this.showDataOnGrid();
	}


	ngOnChanges(changes: SimpleChanges): void {
		if (this.isModal) {
			// this.tabulatorStyle = "width: 100%;height: 500px;position: absolute;overflow-x: scroll; overflow-y: hidden; backgroud-color:white"
			// this.customStyle = `padding-left: 5px; padding-top: 0px;height: calc(100vh - ${this.decreaseHeight}px);display: block;position: absolute;width:900px; background-color:white;`;
			this.tabulatorStyle = "width: 100%;height: auto;position: absolute;overflow-x: scroll; overflow-y: hidden; backgroud-color:white"
			this.customStyle = `padding-left: 5px; padding-top: 0px;display: block;position: absolute;width:900px; background-color:white;`;

		} else {

			this.customStyle = `padding-left: 5px; padding-top: 0px;display: block;position: absolute;`;
			this.tabulatorStyle = "width: 100%;height:auto;position: absolute;overflow-x: scroll; overflow-y: hidden; backgroud-color:white"
		}

		if (changes["searchFilters"]) {
			if (this.tabular) {

				this.tabular.setFilter(this.searchFilters);
			}

		}
		else {

			this.showDataOnGrid();
		}



	}
	editFormatIcon() { //plain text value

		return "<i class='fa fa-edit'></i>";
	};
	deleteFormatIcon() { //plain text value

		return "<i class='fa fa-trash'></i>";
	};
	CheckBoxFormatIcon() { //plain text value

		return "<input id='yourID' type='checkbox' />";
	};
	lang: string = localStorage.getItem("language");
	newColumns = [
		this.lang == "ar" ? {
			title: "حذف",
			field: "id", formatter: this.deleteFormatIcon, cellClick: (e, cell) => {

				this.onDeleteItem.emit(cell.getRow().getData().id);
			},

		} :
			{
				title: "Delete",
				field: "id", formatter: this.deleteFormatIcon, cellClick: (e, cell) => {

					this.onDeleteItem.emit(cell.getRow().getData().id);
				},

			}

		,

		this.lang == "ar" ? {
			title: "تعديل",
			field: "id", formatter: this.editFormatIcon, cellClick: (e, cell) => {

				this.onEditItem.emit(cell.getRow().getData().id);
			}
		}
			:

			{
				title: "Edit",
				field: "id", formatter: this.editFormatIcon, cellClick: (e, cell) => {

					this.onEditItem.emit(cell.getRow().getData().id);
				}
			}
		,
		this.lang == "ar" ? {
			title: "اختار",
			field: "id", formatter: this.CheckBoxFormatIcon, cellClick: (e, cell) => {

				this.onCheckItem.emit(cell.getRow().getData().id);
			}
		}
			:

			{
				title: "check",
				field: "id", formatter: this.CheckBoxFormatIcon, cellClick: (e, cell) => {


					this.onCheckItem.emit(cell.getRow().getData().id);
				}
			}
	]
	showDataOnGrid() {

		console.log("childRowData", this.childRowData)
		if (this.tabular) {
			if (this.columnSettings) {

				if (this.columnSettings.length > 0) {
					//Add Edit Delete Button in grid
					if (this.newColumns != undefined && this.newColumns != null) {

						for (var i = 0; i < this.newColumns.length; i++) {

							const found = this.columnSettings.some(item => item.title === this.newColumns[i].title);

							if (!found) {
								this.columnSettings.push(this.newColumns[i]);
							}

						}
					}
					this.columnNames = [...this.columnSettings];
					this.setHeaderMenu();
					this.setHeaderContextMenu();
					this.tabular.setColumns(this.columnNames);
					this.tabular.setData(this.childRowData);
				}
			}
		}
	}






	sortAndGroup() {
		if (this.sortByList) {
			this.setSorter();

		}
		if (this.groupByList) {
			this.tabular.setGroupBy(this.groupByList);
		}
	}






	//assign show hide function for table header columns
	setHeaderMenu() {
		if (this.columnNames) {
			this.columnNames.forEach(col => {
				col.headerMenu = this.headerMenu;
			});
		}

	}



	headerMenu = function (this: any) {

		let menu: any[] = [];
		let columns = this.getColumns();
		for (let column of columns) {
			//create checkbox element using font awesome icons
			let icon = document.createElement("i");
			icon.classList.add("fa");
			icon.classList.add(column.isVisible() ? "fa-check-square" : "fa-square");

			//build label
			let label = document.createElement("span");
			let title = document.createElement("span");
			//console.log(column, column.getDefinition().title)
			title.textContent = " " + column.getDefinition().title;

			label.appendChild(icon);
			label.appendChild(title);

			//create menu item
			menu.push({
				label: label,
				action: function (e: any) {
					//prevent menu closing
					e.stopPropagation();

					//toggle current column visibility
					column.toggle();

					//change menu item icon
					if (column.isVisible()) {
						icon.classList.remove("fa-square");
						icon.classList.add("fa-check-square");
					} else {
						icon.classList.remove("fa-check-square");
						icon.classList.add("fa-square");
					}
				}
			});
		}
		return menu;
	}










	getIcon = function (cell: any, formatterParams: any) {
		//plain text value
		return "<i class='fa fa-print'></i>";
	}










	getSelectedGridItem(item: any, e: any) {
		//console.log(e.currentTarget.checked);


		this.onSelectItem.emit({ item: item, isChecked: e.currentTarget.checked });


	}





	getContextMenu(row: any, e: any, menuOptions: SettingMenuShowOptions, scope: any, componentName: any) {
		//component - column/cell/row component that triggered the menu
		//e - click event object


		var menu: any[] = [];
		//console.log(component.getData())

		if (menuOptions.showEdit) {

			menu.push(scope.getContextMenuItem(row, componentName,
				"Edit", "../../../assets/sniper/images/dropdown_edit.svg"));
		}
		if (menuOptions.showActivate) {

			menu.push(scope.getContextMenuItem(row, componentName,
				"Activate", "../../../assets/sniper/images/check_icon.svg"));
		}
		if (menuOptions.showDelete) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"Delete", "../../../assets/sniper/images/delete_blue.svg"));
		}
		if (menuOptions.showDeviceNotification) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"DeviceNotification", "../../../assets/sniper/images/dropdown_notification.svg"));
		}

		if (menuOptions.showDeviceGeofence) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"DeviceGeofence", "../../../assets/sniper/images/dropdown_geofences.svg"));
		}

		if (menuOptions.showUserGroup) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"UserGroups", "../../../assets/sniper/images/dropdown_folder.svg"));
		}


		if (menuOptions.showUserDevice) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"UserDevices", "../../../assets/sniper/images/dropdown_device.svg"));
		}

		if (menuOptions.showUserDriver) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"UserDrivers", "../../../assets/sniper/images/dropdown_driver.svg"));
		}

		if (menuOptions.showUserNotification) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"UserNotifications", "../../../assets/sniper/images/dropdown_notification.svg"));
		}

		if (menuOptions.showUserGeofence) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"UserGeofences", "../../../assets/sniper/images/dropdown_geofences.svg"));
		}
		if (menuOptions.showUserRoute) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"UserRoutes", "../../../assets/sniper/images/dropdown_route.svg"));
		}

		if (menuOptions.showUserCity) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"UserCities", "../../../assets/sniper/images/dropdown_city.svg"));
		}

		if (menuOptions.showDeviceComputedAttribute) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"DeviceComputedAttribute", "../../../assets/sniper/images/sensor.svg"));
		}


		if (menuOptions.showWASL) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"WaslItem", "../../../assets/sniper/images/WASL.svg"));
		}

		if (menuOptions.showWaslLog) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"WaslLog", "../../../assets/sniper/images/WASL.svg"));
		}

		if (menuOptions.showCommands) {
			menu.push(scope.getContextMenuItem(row, componentName,
				'DeviceCommand', '../../../assets/sniper/images/Commands.svg'));
		}



		if (menuOptions.showSendCommand) {
			menu.push(scope.getContextMenuItem(row, componentName,
				'SendCommand', '../../../assets/sniper/images/server.svg'));
		}

		if (menuOptions.showSelectGroup) {

			menu.push(scope.getContextMenuItem(row, componentName,
				"SelectGroup", "../../../assets/sniper/images/folder.svg"));
		}

		if (menuOptions.showSelectItem) {

			menu.push(scope.getContextMenuItem(row, componentName,
				"SelectItem", "../../../assets/sniper/images/dropdown_edit.svg"));
		}

		if (menuOptions.showDeleteGroup) {

			menu.push(scope.getContextMenuItem(row, componentName,
				"DeleteGroup", "../../../assets/sniper/images/delete_blue.svg"));
		}

		if (menuOptions.showSensorDevices) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"SensorDevices", "../../../assets/sniper/images/sensor.svg"));
		}

		if (menuOptions.showRegisterAllDevices) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"RegisterAllDevices", "../../../assets/sniper/images/sensor.svg"));
		}


		if (menuOptions.showRegisterAllDrivers) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"RegisterAllDrivers", "../../../assets/sniper/images/sensor.svg"));
		}

		if (menuOptions.showRegisterWaslCustomerDevices) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"RegisterWaslCustomerDevices", "../../../assets/sniper/images/sensor.svg"));
		}

		if (menuOptions.showRegisterWaslCustomerDrivers) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"RegisterWaslCustomerDrivers", "../../../assets/sniper/images/sensor.svg"));
		}

		if (menuOptions.showRegisterItem) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"RegisterItem", "../../../assets/sniper/images/sensor.svg"));
		}


		if (menuOptions.showAdminPanelPermission) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"AdminPanelPermission", "../../../assets/sniper/images/dropdown_notification.svg"));
		}

		if (menuOptions.showRegisterCustomer) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"RegisterCustomer", "../../../assets/sniper/images/WASL.svg"));
		}

		if (menuOptions.showUnRegisterCustomer) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"UnRegisterCustomer", "../../../assets/sniper/images/delete.svg"));
		}

		if (menuOptions.showQueryCustomer) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"QueryCustomer", "../../../assets/sniper/images/WASL.svg"));
		}

		if (menuOptions.showQueryDevice) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"QueryDevice", "../../../assets/sniper/images/WASL.svg"));
		}



		if (menuOptions.showUnRegisterDevice) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"UnRegisterDevice", "../../../assets/sniper/images/WASL.svg"));
		}



		if (menuOptions.showUnAssignSensorFromDevice) {
			menu.push(scope.getContextMenuItem(row, componentName,
				"UnAssignSensorFromDevice", "../../../assets/sniper/images/delete_blue.svg"));
		}


		return menu;
	}


	onMenuAction(row: any, componentName: any, actionName: any) {
		//console.log(row.getData());
		this.onMenuActionSelected.emit({
			componentName: componentName,
			actionName: actionName,
			item: row.getData()
		});
	}


	getContextMenuItem(row: any, componentName: any, actionName: any, iconUrl: any) {
		return {
			//label: `<img src='${iconUrl}'> ${this.translate.transform("settingMenu." + actionName,)}`,
			label: `<img src='${iconUrl}'> ${actionName}`,
			action: (e: any, column: any) => {
				//component.update({ "approved": true });
				this.onMenuAction(row, componentName, actionName);
			}
		}
	}




	onChangColumnsOption = (column: any, scope: any) => {

		if (scope.tabular) {
			let columns = scope.tabular.getColumns();
			for (let i = 0; i < columns.length; i++) {

				this.columnNames[i].visible = columns[i].isVisible();
				this.columnNames[i].width = columns[i].getWidth();
			}
		}

	}


	onShowHideColumn(column: any, visible: any) {
		if (this.tabular) {
			//console.log(this.tabular.getColumns());
			//this.savePanelSettings();

		}

	}

	savePanelSettings() {

		if (this.panelId) {
			let userId = localStorage.getItem("id");
			let colSettings = this.getColumnSettings();


			let panelSetting: PanelSetting = {
				id: 0,
				userId: Number(userId),
				panelId: this.panelId,
				panelSettings: JSON.stringify(colSettings),
				groupByCols: this.getGroupByColAsString(),
				sortByCols: this.getSortByColAsString()
			};

		}
	}




	getGroupByColAsString() {
		let groupByColString: string = "";
		this.groupByList.forEach(g => {
			groupByColString = groupByColString + g + ";";
		});

		groupByColString = groupByColString.slice(0, groupByColString.length - 1);
		return groupByColString;
	}


	getSortByColAsString() {
		//console.log(this.sortByList);
		return JSON.stringify(this.sortByList);
	}






	getColumnSettings() {

		let currentColumns: {}[] = [];
		let columns = this.tabular.getColumns()
		for (let i = 0; i < columns.length; i++) {
			let colDefination = columns[i].getDefinition();

			currentColumns.push({
				title: colDefination.title,
				field: colDefination.field,
				width: columns[i].getWidth(),
				visible: columns[i].isVisible()
			});
		}

		return currentColumns;
	}







	setHeaderContextMenu() {

		if (this.columnNames) {
			this.columnNames.forEach(col => {
				col["headerContextMenu"] = (c: any) => { return this.headerContextMenuSetting(c, this) };
			});
		}

	}

	headerContextMenuSetting(column: any, scope: any) {

		let headerContextMenu = [
			{
				label: "<i class='fa fa-eye'></i> Hide",
				action: function (e: any, column: any) {
					column.hide();
				}
			},
			{
				label: "<i class='fa fa-save'></i> Save Settings",
				action: function (e: any, column: any) {
					if (scope.enableTree) {
						scope.savePanelSettings();
					}
					else {
						scope.saveReportSettings();
					}

				}
			},
			{
				label: "<i class='fa fa-users'></i> Group By",
				action: function (e: any, column: any) {

					let colDefination = column.getDefinition();
					if (colDefination) {

						if (!scope.groupByList.find((a: any) => a == colDefination.field)) {
							scope.groupByList.push(colDefination.field);
							scope.tabular.setGroupBy(scope.groupByList);
						}
					}
				}
			},
			{
				label: "<i class='fa fa-minus-circle'></i> Un Group",
				action: function (e: any, column: any) {

					let colDefination = column.getDefinition();
					if (colDefination) {
						// scope.groupByString = scope.groupByString.replaceAll(colDefination.title, "");
						// scope.groupByString = scope.groupByString.replaceAll(colDefination.title, "");
						//scope.tabular.setGroupBy(scope.groupByString);
						let unGroupFieldName = scope.groupByList.find((a: any) => a == colDefination.field)
						if (unGroupFieldName) {
							let index = scope.groupByList.findIndex((a: any) => a == unGroupFieldName);
							scope.groupByList.splice(index, 1);
							scope.tabular.setGroupBy(scope.groupByList);
						}
					}
				}
			},
			{
				label: "<i class='fa fa-sort'></i> Sort",
				action: function (e: any, column: any) {
					let colDefination = column.getDefinition();
					if (colDefination) {
						// let sortByGroup:any[] = scope.tabular.getSorters();
						//console.log(sortByGroup);
						if (scope.sortByList) {
							//console.log(colDefination, sortByGroup);
							//Check is exist in sort by elements
							let sortBy = scope.sortByList.find((x: any) => x.column == colDefination.field);
							if (sortBy) {
								if (sortBy.dir == "asc") {
									sortBy.dir = "desc";
								}
								else {
									sortBy.dir = "asc";
								}
							}
							else {
								sortBy = {
									column: colDefination.field,
									dir: "asc"
								};

								scope.sortByList.push(sortBy);
							}

							let newSortBy: {}[] = [];
							scope.sortByList.forEach(function (so: any) {
								newSortBy.push({
									column: so.column,
									dir: so.dir
								})
							});


							scope.tabular.setSort(newSortBy);

						}
					}
				}
			}


		]

		return headerContextMenu;
	}


	exportPdf() {
		debugger
		this.tabular.download("pdf", this.componentName + ".pdf", {
		  orientation: "portrait", //set page orientation to portrait
		  title: this.componentName + " " + "Report", //add title to report
		  lang:'ar',
		  unicode:true,
	
	
		});
	  }


	  arabicFont = {
		name: 'Cairo', // Replace with the actual font family name of your Arabic font
		style: 'normal',
		src: 'url(src/assets/fonts/Cairo/Cairo-VariableFont_slnt,wght.ttf)', // Replace with the path to your Arabic font file
	  };
	
	
	  exportJson() {
		this.tabular.download("json", this.componentName + ".json");
	  }
	
	  exportHtml() {
		this.tabular.download("html", this.componentName + ".html", { style: true });
	  }
	
	  exportCsv() {
		this.tabular.download("csv", this.componentName + ".csv");
	  }
	
	  exportExcel() {
		debugger
		this.tabular.download("xlsx", this.componentName + ".xlsx", { sheetName: this.componentName });
	  }
	

	removeGroupItem(index: number) {
		this.groupByList.splice(index, 1);
		this.tabular.setGroupBy(this.groupByList);
	}


	// listenToLanguage() {
	//   let sub = this.sharedService.getLanguage().subscribe(lang => {
	//     if (lang) {
	//       if (lang == "ar") {
	//         this.direction = "rtl";
	//         this.lang = "ar";

	//       }
	//       else {
	//         this.direction = "ltr";
	//         this.lang = lang;
	//       }
	//       //this function custom Added by mosfet not from original source code
	//       this.tabular.setDirection(this.direction);
	//       this.tabular.rtlCheck();

	//       this.translateService.use(lang).subscribe(a => {
	//         this.translateColumns(this.columnNames, this.componentName);
	//         //this.drawTable();
	//         this.tabular.setColumns(this.columnNames);

	//       })
	//     }
	//   });
	//   this.subsList.push(sub);
	// }


	ngOnDestroy() {
		this.subsList.forEach(s => {
			if (s) {
				s.unsubscribe();
			}
		})
	}


	recreateColumnsForTranslate() {

		for (let k = 0; k < this.columnNames.length; k++) {

			this.tabular.deleteColumn(this.columnNames[k].field);
			this.tabular.addColumn(this.columnNames[k]);
		}
	}


	translateColumns(columns: any[], componentName: string) {



		for (let i = 0; i < this.columnNames.length; i++) {
			let col = this.columnNames[i];
			//col.title = this.translate.transform((componentName + "." + col.field));
		}




	}

	getToolTip(cell: any): string | undefined {
		return cell.getColumn().getField() + "\n  " + cell.getValue(); //return cells "field  value";
	}



	resetColumns() {

	}


	afterSort(sorters: any, rows: any) {

		///console.log(sorters, rows);
	}


	removeSortItem() {

	}



	// lisetnToActivePanel() {
	//   let sub = this.sharedService.getActivePanel().subscribe(panelName => {
	//     if (panelName == this.componentName) {

	//       if (this.tabular) {
	//         setTimeout(a => {
	//           this.tabular.setColumns(this.columnNames);
	//           setTimeout(() => {
	//             this.sortAndGroup();
	//           }, 200);


	//         }, 200);

	//       }

	//     }
	//   });

	//   this.subsList.push(sub);
	// }

	sortItems(e: any[]) {
		//
		//let newSortList: any[] = [];
		this.sortByList = [];
		e.forEach(col => {
			if (col.checked) {
				this.sortByList.push({
					column: col.field,
					dir: col.sort
				})
			}
		});
		this.setSorter();
	}

	groupByItems(e: any[]) {
		let newGroupByList: string[] = [];
		e.forEach(col => {
			if (col.checked) {
				newGroupByList.push(col.field);
			}

		});

		this.groupByList = newGroupByList.filter(x => true);
		this.tabular.setGroupBy(this.groupByList);

	}
	showHideArraneColums(e: any[]) {
		//Update current columns setting
		//console.log(this.columnNames);
		let newColSetting: {}[] = [];
		e.forEach(nCol => {
			let currentCol = this.columnNames.find(x => x.field == nCol.field);
			newColSetting.push({
				field: nCol.field,
				title: nCol.title,
				visible: nCol.checked,
				width: currentCol.width,
				headerMenu: currentCol.headerMenu
			})
		});
		//console.log(newColSetting);
		this.tabular.setColumns(newColSetting);
		this.setSorter();


	}

	setSorter() {
		let newSorter: { column: string, dir: string }[] = [];
		if (this.sortByList) {
			this.sortByList.forEach(s => {
				newSorter.push({
					column: s.column,
					dir: s.dir
				});
			});

			this.tabular.setSort(newSorter);
		}
	}

	setGroupBy() {
		this.tabular.setGroupBy(this.groupByList);
	}

	saveColumnsSetting(e: any[]) {
		//type == 1
		let colSettings = this.getColumnSettings();


		this.customMenuSave(JSON.stringify(colSettings).toString(), 1);

	}
	saveGroupBy(e: any[]) {

		//type == 2
		let groupByString: string = "";
		e.forEach(f => {
			if (f.checked) {
				groupByString = groupByString + f.field + ";";
			}

		});

		groupByString = groupByString.length > 0 ? groupByString.slice(0, groupByString.length - 1) : "";
		this.customMenuSave(groupByString, 2);
	}
	saveSortBy(e: any) {

		//type == 3
		this.customMenuSave(JSON.stringify(e), 3);
	}
	customMenuSave(settings: any, type: any) {
		this.updatePanelSetting(settings, type);
	}
	updatePanelSetting(settings: any, type: any) {
		let userId = localStorage.getItem("id");
	}

	saveAllSetting() {
		this.savePanelSettings();
	}

	openAddGroup() {
		// this.store.dispatch(GroupActions.actions.setSelectedWithTypeAction({ data: undefined, typeId: this.groupType }));
		// this.dialogService.openComponent(GroupComponent, {
		//   componentName: "Group"
		// })
		this.onAddGroup.emit();
	}

	openAddItem() {
		this.onAddItem.emit();
		// if(this.groupType == 1)
		// {
		//   this.openAddDevice();
		// }
		// else if(this.groupType == 2)
		// {
		//   this.openAddDriver();
		// }
		// else if(this.groupType == 7)
		// {
		//   this.openAddUser();
		// }
		// else if(this.groupType == -2)
		// {

		//   this.openAddWaslCustomer();
		// }
	}

	// openAddDevice() {

	//   this.dialogService.openComponent(DeviceComponent, {
	//     componentName: "Device",
	//     isBackdrop:true

	//   });

	// }

	// openAddDriver() {
	//   this.dialogService.openComponent(DriverComponent, {
	//     componentName: "Driver"
	//   })
	// }

	// openAddUser() {
	//   this.dialogService.openComponent(UserComponent, {
	//     componentName: "User"
	//   })
	// }




	ngAfterContentInit(): void {


	}
}
