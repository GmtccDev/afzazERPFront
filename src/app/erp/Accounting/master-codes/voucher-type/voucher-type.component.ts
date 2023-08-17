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
    private alertsService: NotificationsAlertsService,
    private modalService: NgbModal,
    private translate: TranslateService
  ) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

    this.listenToClickedButton();

    this.getVoucherTypes();
    setTimeout(() => {

      this.sharedServices.changeButton({ action: 'List' } as ToolbarData);
      this.sharedServices.changeToolbarPath(this.toolbarPathData);
    }, 300);


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
          console.log(res);
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
          console.log('complete');
        },
      });

      this.subsList.push(sub);
    });

  }

  //#endregion

  //#region CRUD Operations
  delete(id: any) {
    this.voucherTypeService.deleteVoucherType(id).subscribe((resonse) => {
      console.log('delet response', resonse);
     // this.getVoucherTypes();
      this.router.navigate([this.listUrl])
      .then(() => {
        window.location.reload();
      });
    });
  }
  edit(id: string) {
    ;
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
      console.log(rs);
      if (rs == 'Confirm') {
        let sub = this.voucherTypeService.deleteVoucherType(id).subscribe(
          (resonse) => {
           // this.getVoucherTypes();
           this.router.navigate([this.listUrl])
           .then(() => {
             window.location.reload();
           });
          });
        this.subsList.push(sub);
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
      ? { title: ' الاسم', field: 'voucherNameAr' } :
      { title: ' Name  ', field: 'voucherNameEn' },
    {
      title: this.lang == 'ar' ? 'تاريخ الانشاء' : 'Create Date',
      field: 'createdAt',
    },
    // {
    //   title: this.lang == 'ar' ? 'تم الانشاء بواسطة' : 'Created by',
    //   field: 'createdBy',
    // },
    {
      title: this.lang == 'ar' ? 'تاريخ التعديل' : 'Update Date',
      field: 'updatedAt',
    },
    // {
    //   title: this.lang == 'ar' ? 'تم التعديل بواسطة' : 'Updated by',
    //   field: 'updateBy',
    // },

  ];

  menuOptions: SettingMenuShowOptions = {
    showDelete: true,
    showEdit: true,
  };

  direction: string = 'ltr';

  onSearchTextChange(searchTxt: string) {
    this.searchFilters = [
      [
        { field: 'voucherNameEn', type: 'like', value: searchTxt },
        { field: 'voucherNameAr', type: 'like', value: searchTxt },
        { field: 'id', type: 'like', value: searchTxt },
        ,
      ],
    ];
  }

  openVoucherTypes() { }
  onCheck(id) {

    this.listIds.push(id);
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
    var ids = this.listIds;
    let sub = this.voucherTypeService.deleteListVoucherType(ids).subscribe(
      (resonse) => {
        this.router.navigate([this.listUrl])
        .then(() => {
          window.location.reload();
        });
       // this.getVoucherTypes();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  //#endregion
}
