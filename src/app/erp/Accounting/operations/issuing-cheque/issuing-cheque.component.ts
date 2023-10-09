import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { NotificationsAlertsService } from '../../../../shared/common-services/notifications-alerts.service';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { Subscription } from 'rxjs';
import { ITabulatorActionsSelected } from '../../../../shared/interfaces/ITabulator-action-selected';
import { MessageModalComponent } from '../../../../shared/components/message-modal/message-modal.component'
import { SettingMenuShowOptions } from 'src/app/shared/components/models/setting-menu-show-options';
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions';
import format from 'date-fns/format';
import { IssuingChequeServiceProxy } from '../../services/issuing-cheque.services';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-issuing-cheque',
  templateUrl: './issuing-cheque.component.html',
  styleUrls: ['./issuing-cheque.component.scss']
})
export class IssuingChequeComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  editFormatIcon() { //plain text value
    return "<i class=' fa fa-edit'></i>";
  };
  issuingCheque: any[] = [];
  lang: string = localStorage.getItem("language");

  currnetUrl: any;
  addUrl: string = '/accounting-operations/issuingCheque/add-issuingCheque';
  updateUrl: string = '/accounting-operations/issuingCheque/update-issuingCheque/';
  listUrl: string = '/accounting-operations/issuingCheque';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.issuing-cheque"),
    componentAdd: '',

  };
  listIds: any[] = [];
  //#endregion

  //#region Constructor
  constructor(
    private issuingChequeService: IssuingChequeServiceProxy,
    private router: Router,
    private sharedServices: SharedService,
    private alertsService: NotificationsAlertsService,
    private modalService: NgbModal,
    private translate: TranslateService,
    private spinner: NgxSpinnerService,


  ) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    //  this.defineGridColumn();
    this.spinner.show();
    Promise.all([this.getIssuingChequees()])
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
  getIssuingChequees() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.issuingChequeService.allIssuingChequees(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          console.log(res);

          this.toolbarPathData.componentList = this.translate.instant("component-names.issuing-cheque");
          if (res.success) {
            this.issuingCheque = res.response.items
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

  //#region CRUD operations
  delete(id: any) {
    this.issuingChequeService.deleteIssuingCheque(id).subscribe((resonse) => {
      this.getIssuingChequees();
    });
  }
  edit(id: string) {
    
    this.router.navigate([
      '/accounting-operations/issuingCheque/update-issuingCheque',
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

        let sub = this.issuingChequeService.deleteIssuingCheque(id).subscribe(
          (resonse) => {

            //reloadPage()
            this.getIssuingChequees();

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
  columnNames = [

    {
      title: this.lang == 'ar' ? ' الكود' : 'code ',
      field: 'code',
    },
    this.lang == 'ar'
      ? {
        title: '  تاريخ  ', width: 300, field: 'date', formatter: function (cell, formatterParams, onRendered) {
          var value = cell.getValue();
          value = format(new Date(value), 'dd-MM-yyyy');;
          return value;
        }
      } : {
        title: 'Date', width: 300, field: 'date', formatter: function (cell, formatterParams, onRendered) {
          var value = cell.getValue();
          value = format(new Date(value), 'dd-MM-yyyy');;
          return value;
        }
      },
    this.lang == "ar" ? {
      title: "تحصيل",
      field: "", formatter: this.editFormatIcon, cellClick: (e, cell) => {
        this.showConfirmCollectMessage(cell.getRow().getData().id);
      }
    } :
      {
        title: "Collect",
        field: "", formatter: this.editFormatIcon, cellClick: (e, cell) => {
          this.showConfirmCollectMessage(cell.getRow().getData().id);
        },
      },
    this.lang == "ar" ? {
      title: "رفض",
      field: "", formatter: this.editFormatIcon, cellClick: (e, cell) => {
        this.showConfirmRejectMessage(cell.getRow().getData().id);
      }
    } :
      {
        title: "Reject",
        field: "", formatter: this.editFormatIcon, cellClick: (e, cell) => {
          this.showConfirmRejectMessage(cell.getRow().getData().id);
        },
      }
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

  openIssuingChequees() { }
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
      this.router.navigate(['accounting-operations/issuingCheque/update-issuingCheque/' + id])
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
        this.router.navigate(['accounting-operations/issuingCheque/update-issuingCheque/' + event.item.id])

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


    var ids = this.listIds;
    let sub = this.issuingChequeService.deleteListIssuingCheque(ids).subscribe(
      (resonse) => {

        //reloadPage()
        this.getIssuingChequees();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  //#endregion
  showConfirmCollectMessage(id: any) {
    const modalRef = this.modalService.open(MessageModalComponent);
    modalRef.componentInstance.message = this.translate.instant('incoming-cheque.confirm-collect');
    modalRef.componentInstance.title = this.translate.instant('general.confirm');
    modalRef.componentInstance.btnConfirmTxt = this.translate.instant('incoming-cheque.collect');

    modalRef.componentInstance.isYesNo = true;
    modalRef.result.then((rs) => {
      if (rs == 'Confirm') {
        this.spinner.show();
        let sub = this.issuingChequeService.collect(id).subscribe({
          next: (result: any) => {
            this.alertsService.showError(
              this.translate.instant("incoming-cheque.collect-cheque-done"),
              ""
            )
            return;

          },
          error: (err: any) => {
          },
          complete: () => {
            console.log('complete');
          },
        });
        this.subsList.push(sub);
        this.spinner.hide();


      }
    });
  }
  showConfirmRejectMessage(id: any) {
    const modalRef = this.modalService.open(MessageModalComponent);
    modalRef.componentInstance.message = this.translate.instant('incoming-cheque.confirm-reject');
    modalRef.componentInstance.title = this.translate.instant('general.confirm');
    modalRef.componentInstance.btnConfirmTxt = this.translate.instant('incoming-cheque.reject');

    modalRef.componentInstance.isYesNo = true;
    modalRef.result.then((rs) => {
      if (rs == 'Confirm') {
        this.spinner.show();
        let sub=this.issuingChequeService.reject(id).subscribe({
          next: (result: any) => {
            this.alertsService.showError(
              this.translate.instant("incoming-cheque.reject-cheque-done"),
              ""
            )
            return;

          },
          error: (err: any) => {
          },
          complete: () => {
            console.log('complete');
          },
        });
        this.subsList.push(sub);
        this.spinner.hide();
      }
    });
  }
}
