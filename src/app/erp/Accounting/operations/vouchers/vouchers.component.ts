import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ITabulatorActionsSelected } from '../../../../shared/interfaces/ITabulator-action-selected';
import { MessageModalComponent } from '../../../../shared/components/message-modal/message-modal.component'
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions';
import { VoucherServiceProxy } from '../../services/voucher.service';
import { SharedService } from '../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../shared/interfaces/toolbar-path';
import { ToolbarData } from '../../../../shared/interfaces/toolbar-data';
import { SettingMenuShowOptions } from 'src/app/shared/components/models/setting-menu-show-options';
import { NgxSpinnerService } from 'ngx-spinner';
import { VoucherTypeServiceProxy } from '../../services/voucher-type.service';
import { format } from 'date-fns';
@Component({
  selector: 'app-vouchers',
  templateUrl: './vouchers.component.html',
  styleUrls: ['./vouchers.component.scss']
})
export class VouchersComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  vouchers: any[] = [];
  voucherType: any[] = [];
  voucherTypeId: any;
  currnetUrl: any;
  queryParams: any;
  sub: any;

  addUrl: string = '/accounting-operations/vouchers/add-voucher/';
  updateUrl: string = '/accounting-operations/vouchers/update-voucher/';
  listUrl: string = '/accounting-operations/vouchers/';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.vouchers"),
    componentAdd: '',

  };
  listIds: any[] = [];

  //#endregion

  //#region Constructor
  constructor(
    private voucherService: VoucherServiceProxy,
    private router: Router,
    private route: ActivatedRoute,
    private sharedServices: SharedService,
    private modalService: NgbModal,
    private translate: TranslateService,
    private spinner: NgxSpinnerService,
    private voucherTypeService: VoucherTypeServiceProxy,

  ) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    //  this.defineGridColumn();
    let sub = this.route.params.subscribe(params => {
      if (params['voucherTypeId'] != null) {
        this.voucherTypeId = +params['voucherTypeId'];
        this.getVoucherTypes(this.voucherTypeId);


      }
    })
    this.subsList.push(sub);
    this.spinner.show();
    Promise.all([this.getVouchers()])
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
  nameEn: any;
  nameAr: any;
  getVoucherTypes(id) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherTypeService.getVoucherType(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.voucherType = res.response;
            this.sharedServices.changeToolbarPath(this.toolbarPathData.componentList = this.lang == 'ar' ? res.response.nameAr : res.response.nameEn)

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

  getVouchers() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherService.allVouchers(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          if (res.success) {
            this.vouchers = res.response.items.filter(x => x.voucherTypeId == this.voucherTypeId && x.branchId == this.branchId && x.companyId == this.companyId)

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
    this.voucherService.deleteVoucher(id).subscribe((resonse) => {
      this.getVouchers();
      this.router.navigate([this.listUrl + this.voucherTypeId])
        .then(() => {
          window.location.reload();
        });
    });
  }
  edit(id: string) {

    this.router.navigate([
      '/accounting-operations/vouchers/update-voucher/',
      this.voucherTypeId, id,
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
        let sub = this.voucherService.deleteVoucher(id).subscribe(
          (resonse) => {
            this.getVouchers();
            this.router.navigate([this.listUrl + this.voucherTypeId])
              .then(() => {
                //   window.location.reload();
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
  branchId: string = localStorage.getItem("branchId");
  companyId: string = localStorage.getItem("companyId");

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
    {
      title: this.lang == 'ar' ? 'الاجمالى محلى' : 'Total Local',
      field: 'voucherTotalLocal',
    },
    {
      title: this.lang == 'ar' ? 'الوصف' : 'Description',
      field: 'description',
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
        { field: 'code', type: 'like', value: searchTxt },
        { field: 'voucherTotal', type: 'like', value: searchTxt },
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

            this.router.navigate([this.addUrl + this.voucherTypeId]);
            //  this.router.navigate(['/control-panel/accounting/update-account', id]);

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
    let sub = this.voucherService.deleteListVoucher(ids).subscribe(
      (resonse) => {
        this.router.navigate([this.listUrl + this.voucherTypeId])
          .then(() => {
            window.location.reload();
          });
        this.getVouchers();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  //#endregion
}
