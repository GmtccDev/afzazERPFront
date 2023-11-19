import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ITabulatorActionsSelected } from '../../../../shared/interfaces/ITabulator-action-selected';
import { MessageModalComponent } from '../../../../shared/components/message-modal/message-modal.component'
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions';
import { SharedService } from '../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../shared/interfaces/toolbar-path';
import { ToolbarData } from '../../../../shared/interfaces/toolbar-data';
import { NgxSpinnerService } from 'ngx-spinner';
import { SettingMenuShowOptions } from '../../../../shared/components/models/setting-menu-show-options';
import { BillTypeServiceProxy } from '../../Services/bill-type.service';
import { BillServiceProxy } from '../../services/bill.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss']
})
export class BillComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  bills: any[] = [];
  billType: any[] = [];
  billTypeId: any;

  currnetUrl: any;
  queryParams: any;

  addUrl: string = '/warehouses-operations/bill/add-bill/';
  updateUrl: string = '/warehouses-operations/bill/update-bill/';
  listUrl: string = '/warehouses-operations/bill/';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.bills"),
    componentAdd: '',

  };
  listIds: any[] = [];

  //#endregion

  //#region Constructor
  constructor(
    private billService: BillServiceProxy,
    private router: Router,
    private route: ActivatedRoute,
    private sharedServices: SharedService,
    private modalService: NgbModal,
    private translate: TranslateService,
    private spinner: NgxSpinnerService,
    private billTypeService: BillTypeServiceProxy,

  ) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    if (!localStorage.getItem('foo')) {
      localStorage.setItem('foo', 'no reload')
      location.reload()

    } else {
      localStorage.removeItem('foo')

    }
    let sub = this.route.params.subscribe(params => {
      if (params['billTypeId'] != null) {
        this.billTypeId = +params['billTypeId'];
        this.getBillTypes(this.billTypeId);


      }
    })
    this.subsList.push(sub);
    this.spinner.show();
    Promise.all([this.getBills()])
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
  getBillTypes(id) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.billTypeService.getBillType(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.billType = res.response;
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

  getBills() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.billService.allBills(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          if (res.success) {
            this.bills = res.response.items.filter(x => x.billTypeId == this.billTypeId && x.branchId == this.branchId && x.companyId == this.companyId)

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
    this.billService.deleteBill(id).subscribe((resonse) => {
      this.getBills();
      this.router.navigate([this.listUrl + this.billTypeId])
        .then(() => {
          window.location.reload();
        });
    });
  }
  edit(id: string) {
    this.router.navigate([
      '/warehouses-operations/bill/update-bill/',
      this.billTypeId, id,
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
        let sub = this.billService.deleteBill(id).subscribe(
          (resonse) => {
            this.getBills();
            this.router.navigate([this.listUrl + this.billTypeId])

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
      field: 'date', width: 300, formatter: function (cell, formatterParams, onRendered) {
        var value = cell.getValue();
        value = format(new Date(value), 'dd-MM-yyyy');;
        return value;
      }

    },
    {
      title: this.lang == 'ar' ? 'الاجمالى قبل الضريبة' : 'Total Before Tax',
      field: 'totalBeforeTax',
    },
    {
      title: this.lang == 'ar' ? 'الأجمالى' : 'total',
      field: 'total',
    },
    {
      title: this.lang == 'ar' ? 'الصافى' : 'Net',
      field: 'net',
    },
    // {
    //   title: this.lang == 'ar' ? 'الصافى بعد الضريبة' : 'Net After Tax',
    //   field: 'netAfterTax',
    // },
    {
      title: this.lang == 'ar' ? 'المدفوع' : 'Paid',
      field: 'paid',
    },
    {
      title: this.lang == 'ar' ? 'المتبقى' : 'Remaining',
      field: 'remaining',
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
        { field: 'totalBeforeTax', type: 'like', value: searchTxt },
        { field: 'total', type: 'like', value: searchTxt },
        { field: 'net', type: 'like', value: searchTxt },
        // { field: 'netAfterTax', type: 'like', value: searchTxt },
        { field: 'paid', type: 'like', value: searchTxt },
        { field: 'remaining', type: 'like', value: searchTxt },


        ,
      ],
    ];
  }

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

        if (currentBtn != null) {
          if (currentBtn.action == ToolbarActions.List) {

          } else if (currentBtn.action == ToolbarActions.New) {

            this.router.navigate([this.addUrl + this.billTypeId]);

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
    let sub = this.billService.deleteListBill(ids).subscribe(
      (resonse) => {
        this.router.navigate([this.listUrl + this.billTypeId])
          .then(() => {
            window.location.reload();
          });
        this.getBills();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  //#endregion


}
