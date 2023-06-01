import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsAlertsService } from '../../../../shared/common-services/notifications-alerts.service';
import { Subscription } from 'rxjs';
import { ITabulatorActionsSelected } from '../../../../shared/interfaces/ITabulator-action-selected';
import { MessageModalComponent } from '../../../../shared/components/message-modal/message-modal.component'
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions';
import { VoucherServiceProxy } from '../../services/voucher.service';
import { SharedService } from '../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../shared/interfaces/toolbar-path';
import { ToolbarData } from '../../../../shared/interfaces/toolbar-data';
import { SettingMenuShowOptions } from 'src/app/shared/components/models/setting-menu-show-options';
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
    private alertsService: NotificationsAlertsService,
    private modalService: NgbModal,
    private translate: TranslateService
  ) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
      if (params['voucherTypeId'] != null) {
        this.voucherTypeId = +params['voucherTypeId'];
       //  this.getVoucherTypes(this.voucherTypeId);


      }

    })
    // this.queryParams = this.route.queryParams.subscribe(params => {
    //   if (params['voucherTypeId'] != null) {
    //     this.voucherTypeId = params['voucherTypeId'];
    //   }
    // })
    this.subsList.push(this.sub);


  }

  ngAfterViewInit(): void {

    this.listenToClickedButton();

    this.getVouchers();
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
  getVoucherTypes(id) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherService.getVoucher(id).subscribe({
        next: (res) => {
          console.log(res);
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
  getVouchers() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherService.allVouchers(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          console.log(res);
          this.toolbarPathData.componentList = this.translate.instant("component-names.vouchers");
          if (res.success) {
            debugger
            this.vouchers = res.response.items.filter(x=>x.voucherTypeId==this.voucherTypeId && x.branchId==this.branchId&&x.companyId==this.companyId)

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
    this.voucherService.deleteVoucher(id).subscribe((resonse) => {
      console.log('delete response', resonse);
      this.getVouchers();
      this.router.navigate([this.listUrl+this.voucherTypeId])
      .then(() => {
        window.location.reload();
      });
    });
  }
  edit(id: string) {
    debugger
    this.router.navigate([
      '/accounting-operations/vouchers/update-voucher/',
      this.voucherTypeId,id,
    ]);
  }

  //#endregion



  showConfirmDeleteMessage(id) {
    const modalRef = this.modalService.open(MessageModalComponent);
    modalRef.result.then((rs) => {
      console.log(rs);
      if (rs == 'Confirm') {
        debugger
        let sub = this.voucherService.deleteVoucher(id).subscribe(
          (resonse) => {
            this.getVouchers();
           this.router.navigate([this.listUrl+this.voucherTypeId])
           .then(() => {
          //   window.location.reload();
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
  branchId:string= localStorage.getItem("branchId");
  companyId:string= localStorage.getItem("companyId");

  columnNames = [
    {
      title: this.lang == 'ar' ? ' كود' : 'Code ',
      field: 'code',
    },
    {
      title: this.lang == 'ar' ? ' تاريخ' : 'Date ',
      field: 'voucherDate',
    },
    {
      title: this.lang == 'ar' ? ' أجمالى قيمة السند' : 'Voucher Total ',
      field: 'voucherTotal',
    },
    {
      title: this.lang == 'ar' ? 'الوصف' : 'Description',
      field: 'description',
    },

    {
      title: this.lang == 'ar' ? 'تاريخ الانشاء' : 'Create Date',
      field: 'createdAt',
    },
  
    {
      title: this.lang == 'ar' ? 'تاريخ التعديل' : 'Update Date',
      field: 'updatedAt',
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
     // this.router.navigate(['accounting-operations/vouchers/update-voucher/' + id])
    }

  }
  onMenuActionSelected(event: ITabulatorActionsSelected) {

    if (event != null) {
      if (event.actionName == 'Edit') {
        debugger
        this.edit(event.item.id);
        this.sharedServices.changeButton({
          action: 'Update',
          componentName: 'List',
          submitMode: false
        } as ToolbarData);

        this.sharedServices.changeToolbarPath(this.toolbarPathData);
      //  this.router.navigate(['accounting-opertions/vouchers/update-voucher/' + event.item.id])

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
            
            this.router.navigate([this.addUrl+this.voucherTypeId]);
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
    var ids = this.listIds;
    let sub = this.voucherService.deleteListVoucher(ids).subscribe(
      (resonse) => {
        this.router.navigate([this.listUrl+this.voucherTypeId])
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
