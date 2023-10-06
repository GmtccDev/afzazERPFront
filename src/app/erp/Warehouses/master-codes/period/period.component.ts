import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../shared/interfaces/toolbar-path';
import { ToolbarData } from '../../../../shared/interfaces/toolbar-data';
import { Subscription } from 'rxjs';
import { ITabulatorActionsSelected } from '../../../../shared/interfaces/ITabulator-action-selected';
import { MessageModalComponent } from '../../../../shared/components/message-modal/message-modal.component'
import { SettingMenuShowOptions } from '../../../../shared/components/models/setting-menu-show-options';
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions'
import format from 'date-fns/format';
import { NgxSpinnerService } from 'ngx-spinner';
import { DeleteListPeriodCommand, PeriodDto } from '../../models/period';
import { PeriodServiceProxy } from '../../Services/period.service';
@Component({
  selector: 'app-period',
  templateUrl: './period.component.html',
  styleUrls: ['./period.component.scss']
})
export class PeriodComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  periods: PeriodDto[] = [];
  currnetUrl: any;
  addUrl: string = '/warehouses-master-codes/period/add-period';
  updateUrl: string = '/warehouses-master-codes/period/update-period/';
  listUrl: string = '/warehouses-master-codes/period';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.period"),
    componentAdd: '',

  };
  listIds: any[] = [];
  //#endregion

  //#region Constructor
  constructor(
    private periodService: PeriodServiceProxy,
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
    Promise.all([this.getPeriods()])
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
  getPeriods() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.periodService.allPeriods(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.period");
          if (res.success) {
            this.periods = res.response.items

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
    this.periodService.deletePeriod(id).subscribe((resonse) => {
      this.getPeriods();
    });
  }
  edit(id: string) {
    this.router.navigate([
      '/accounting-master-codes/period/update-period',
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
        const input={
          tableName:"Periods",
          id:id,
          idName:"Id"
        };
        let sub = this.periodService.deleteEntity(input).subscribe(
          (resonse) => {

            this.getPeriods();

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
  lang = localStorage.getItem("language");
  columnNames = [
    this.lang == 'ar'
      ? { title: ' الاسم', field: 'nameAr' } :
      { title: ' Name  ', field: 'nameEn' },

    {
      title: this.lang == 'ar' ? ' الكود' : 'code ',
      field: 'code',
    },
    this.lang == 'ar'
      ? {
        title: '  تاريخ  ', width: 300, field: 'fromDate', formatter: function (cell, formatterParams, onRendered) {
          var value = cell.getValue();
          value = format(new Date(value), 'dd-MM-yyyy');;
          return value;
        }
      } : {
        title: ' from Date', width: 300, field: 'fromDate', formatter: function (cell, formatterParams, onRendered) {
          var value = cell.getValue();
          value = format(new Date(value), 'dd-MM-yyyy');;
          return value;
        }
      },
    this.lang == 'ar'
      ? {
        title: ' الي تاريخ  ', width: 300, field: 'toDate', formatter: function (cell, formatterParams, onRendered) {
          var value = cell.getValue();
          value = format(new Date(value), 'dd-MM-yyyy');;
          return value;
        }
      } : {
        title: '  To Date', width: 300, field: 'toDate', formatter: function (cell, formatterParams, onRendered) {
          var value = cell.getValue();
          value = format(new Date(value), 'dd-MM-yyyy');;
          return value;
        }
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

  openPeriods() { }
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
      this.router.navigate(['warehouses-master-codes/period/update-period/' + id])
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
        this.router.navigate(['warehouses-master-codes/period/update-period/' + event.item.id])

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

    let item = new DeleteListPeriodCommand();
    item.ids = this.listIds.map(item => item.id);
    const input={
      tableName:"Periods",
      ids: this.listIds,
      idName:"Id"
    };
    let sub = this.periodService.deleteListEntity(input).subscribe(
      (resonse) => {

        //reloadPage()
        this.getPeriods();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  
  //#endregion
}
