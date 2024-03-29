import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsAlertsService } from '../../../../shared/common-services/notifications-alerts.service';
import { Subscription } from 'rxjs';
import { ITabulatorActionsSelected } from '../../../../shared/interfaces/ITabulator-action-selected';
import { MessageModalComponent } from '../../../../shared/components/message-modal/message-modal.component'
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions';
import { VoucherTypeServiceProxy } from '../../services/voucher-type.service';
import { SharedService } from '../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../shared/interfaces/toolbar-path';
import { ToolbarData } from '../../../../shared/interfaces/toolbar-data';
import { SettingMenuShowOptions } from 'src/app/shared/components/models/setting-menu-show-options';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-voucher-type',
  templateUrl: './voucher-type.component.html',
  styleUrls: ['./voucher-type.component.scss']
})
export class VoucherTypeComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  voucherType: any[] = [];
  currnetUrl: any;
  addUrl: string = '/accounting-master-codes/voucherType/add-voucher-type';
  updateUrl: string = '/accounting-master-codes/voucherType/update-voucher-type/';
  listUrl: string = '/accounting-master-codes/voucherType';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.voucher-types"),
    componentAdd: '',

  };
  listIds: any[] = [];

  //#endregion

  //#region Constructor
  constructor(
    private voucherTypeService: VoucherTypeServiceProxy,
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
    //this.defineGridColumn();
    this.spinner.show();
    Promise.all([ this.getVoucherTypes()])
    .then(a=>{
      this.spinner.hide();
      this.sharedServices.changeButton({ action: 'List' } as ToolbarData);
      this.sharedServices.changeToolbarPath(this.toolbarPathData);
      this.listenToClickedButton();
    }).catch(err=>{
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
  getVoucherTypes() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherTypeService.allVoucherTypees(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          this.toolbarPathData.componentList = this.translate.instant("component-names.voucher-types");
          if (res.success) {
            this.voucherType = res.response.items

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
  delete(id: any) {
    this.voucherTypeService.deleteVoucherType(id).subscribe((resonse) => {
     // this.getVoucherTypes();
      this.router.navigate([this.listUrl])
      .then(() => {
        window.location.reload();
      });
    });
  }
  edit(id: string) {
    this.router.navigate([
      '/accounting-master-codes/voucherType/update-voucher-type',
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
      if (rs == 'Confirm') {
        this.spinner.show();

        let sub = this.voucherTypeService.deleteVoucherType(id).subscribe(
          (resonse) => {
           this.router.navigate([this.listUrl])
           .then(() => {
             window.location.reload();
           });
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
      title: this.lang == 'ar' ? ' رقم' : 'id ',
      field: 'id',
    },
    this.lang == 'ar'
      ? { title: ' الاسم', field: 'nameAr' } :
      { title: ' Name  ', field: 'nameEn' }
    

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
        { field: 'id', type: 'like', value: searchTxt },
        ,
      ],
    ];
  }

  openVoucherTypes() { }
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
      this.router.navigate(['accounting-master-codes/voucherType/update-voucher-type/' + id])
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
        this.router.navigate(['accounting-master-codes/voucherType/update-voucher-type/' + event.item.id])

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
    var ids = this.listIds.map(item => item.id);
    let sub = this.voucherTypeService.deleteListVoucherType(ids).subscribe(
      (resonse) => {
        this.router.navigate([this.listUrl])
        .then(() => {
          window.location.reload();
        });
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  //#endregion
}
