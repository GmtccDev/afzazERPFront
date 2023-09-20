import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { Subscription } from 'rxjs';
import { WarehousesUnitDto, DeleteListWarehousesUnitCommand } from '../../../models/warehouses-unit';
import { MessageModalComponent } from '../../../../../shared/components/message-modal/message-modal.component';
import { SettingMenuShowOptions } from '../../../../../shared/components/models/setting-menu-show-options';
import { ITabulatorActionsSelected } from '../../../../../shared/interfaces/ITabulator-action-selected';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { NgxSpinnerService } from 'ngx-spinner';
import { WarehousesUnitServiceProxy } from '../../../Services/warehousesunit.servies';
@Component({
  selector: 'app-warehouses-units',
  templateUrl: './warehouses-units.component.html',
  styleUrls: ['./warehouses-units.component.scss']
})
export class WarehousesUnitsComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  warehousesUnits: WarehousesUnitDto[] = [];
  currnetUrl: any;
  addUrl: string = '/warehouses-master-codes/warehousesUnit/add-warehousesUnit';
  updateUrl: string = '/warehouses-master-codes/warehousesUnit/update-warehousesUnit/';
  listUrl: string = '/warehouses-master-codes/warehousesUnit';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.units"),
    componentAdd: '',

  };
  listIds: any[] = [];
  //#endregion

  //#region Constructor
  constructor(
    private warehousesUnitService: WarehousesUnitServiceProxy,
    private router: Router,
    private sharedService: SharedService,
    private modalService: NgbModal,
    private translate: TranslateService,
    private spinner: NgxSpinnerService

  ) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    // this.defineGridColumn();
    this.spinner.show();
    Promise.all([this.getWarehousesUnits()])
      .then(a => {
        this.spinner.hide();
        this.sharedService.changeButton({ action: 'List' } as ToolbarData);
        this.sharedService.changeToolbarPath(this.toolbarPathData);
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
  getWarehousesUnits() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.warehousesUnitService.all(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          this.toolbarPathData.componentList = this.translate.instant("component-names.units");
          if (res.success) {
            this.warehousesUnits = res.response.items

          }


          resolve();

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });

      this.subsList.push(sub);
    });

  }

  //#endregion

  //#region CRUD Operations
  delete(id: any) {
    this.warehousesUnitService.deleteWarehousesUnit(id).subscribe((resonse) => {
      this.getWarehousesUnits();
    });
  }
  edit(id: string) {
    this.router.navigate([
      '/warehouses-master-codes/warehousesUnit/update-warehousesUnit',
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
      console.log(rs);
      if (rs == 'Confirm') {
        this.spinner.show();
        const input = {
          tableName: "warehousesUnits",
          id: id,
          idName: "Id"
        };
        let sub = this.warehousesUnitService.deleteEntity(input).subscribe(
          (resonse) => {

            //reloadPage()
            this.getWarehousesUnits();

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
  lang = localStorage.getItem("language")
  columnNames = [
    this.lang == 'ar'
      ? { title: ' الاسم', field: 'nameAr' } :
      { title: ' Name  ', field: 'nameEn' },

    {
      title: this.lang == 'ar' ? ' الكود' : 'code ',
      field: 'code',
    },
    

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

  openWarehousesUnits() { }
  onCheck(id) {

    this.listIds.push(id);
    this.sharedService.changeButton({
      action: 'Delete',
      componentName: 'List',
      submitMode: false
    } as ToolbarData);
  }
  onEdit(id) {

    if (id != undefined) {
      this.edit(id);
      this.sharedService.changeButton({
        action: 'Update',
        componentName: 'List',
        submitMode: false
      } as ToolbarData);

      this.sharedService.changeToolbarPath(this.toolbarPathData);
      this.router.navigate(['warehouses-master-codes/warehousesUnit/update-warehousesUnit/' + id])
    }

  }
  onMenuActionSelected(event: ITabulatorActionsSelected) {

    if (event != null) {
      if (event.actionName == 'Edit') {
        this.edit(event.item.id);
        this.sharedService.changeButton({
          action: 'Update',
          componentName: 'List',
          submitMode: false
        } as ToolbarData);

        this.sharedService.changeToolbarPath(this.toolbarPathData);
        this.router.navigate(['warehouses-master-codes/warehousesUnit/update-warehousesUnit/' + event.item.id])

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

    let sub = this.sharedService.getClickedbutton().subscribe({
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

    let item = new DeleteListWarehousesUnitCommand();
    item.ids = this.listIds;
    const input = {
      tableName: "WarehousesUnits",
      ids: this.listIds,
      idName: "Id"
    };
    let sub = this.warehousesUnitService.deleteListEntity(input).subscribe(
      (resonse) => {

        //reloadPage()
        this.getWarehousesUnits();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  //#endregion
}
