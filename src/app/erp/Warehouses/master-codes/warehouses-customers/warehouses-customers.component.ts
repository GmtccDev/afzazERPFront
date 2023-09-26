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
import { NgxSpinnerService } from 'ngx-spinner';
import { DeleteListWarehousesCustomer, WarehousesCustomerDto } from '../../models/warehouses-customer';
import { WarehousesCustomerServiceProxy } from '../../Services/warehouses-customer.service';
@Component({
  selector: 'app-warehouses-Customers',
  templateUrl: './warehouses-Customers.component.html',
  styleUrls: ['./warehouses-Customers.component.scss']
})
export class WarehousesCustomersComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  warehousesCustomers: WarehousesCustomerDto[] = [];
  currnetUrl: any;
  addUrl: string = '/warehouses-master-codes/warehousesCustomer/add-warehousesCustomer';
  updateUrl: string = '/warehouses-master-codes/warehousesCustomer/update-warehousesCustomer/';
  listUrl: string = '/warehouses-master-codes/warehousesCustomer';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.warehouses-customer"),
    componentAdd: '',

  };
  listIds: any[] = [];
  //#endregion

  //#region Constructor
  constructor(
    private warehousesCustomerService: WarehousesCustomerServiceProxy,
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
    Promise.all([this.getWarehousesCustomers()])
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
  getWarehousesCustomers() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.warehousesCustomerService.allWarehousesCustomers(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.warehouses-customer");
          if (res.success) {
            this.warehousesCustomers = res.response.items

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
    this.warehousesCustomerService.deleteWarehousesCustomer(id).subscribe((resonse) => {
      this.getWarehousesCustomers();
    });
  }
  edit(id: string) {
    this.router.navigate([
      '/warehouses-master-codes/warehousesCustomer/update-warehousesCustomer',
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
          tableName:"WarehousesCustomers",
          id:id,
          idName:"Id"
        };
        let sub = this.warehousesCustomerService.deleteEntity(input).subscribe(
          (resonse) => {

            this.getWarehousesCustomers();

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
      title: this.lang == 'ar' ? ' الكود' : 'Code ',
      field: 'code',
    },
    {
      title: this.lang == 'ar' ? 'الهاتف' : 'Phone',
      field: 'phone',
    },
    {
      title: this.lang == 'ar' ? 'البريد الالكترونى' : 'Email',
      field: 'email',
    },
    {
      title: this.lang == 'ar' ? 'رقم الحساب' : 'Account Number',
      field: 'accountId',
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
        { field: 'phone', type: 'like', value: searchTxt },
        { field: 'email', type: 'like', value: searchTxt },
        { field: 'accountId', type: 'like', value: searchTxt }

        ,
      ],
    ];
  }

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
      this.router.navigate(['warehouses-master-codes/warehousesCustomer/update-warehousesCustomer/' + id])
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
        this.router.navigate(['warehouses-master-codes/warehousesCustomer/update-warehousesCustomer/' + event.item.id])

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

    let item = new DeleteListWarehousesCustomer();
    item.ids = this.listIds;
    const input={
      tableName:"WarehousesCustomers",
      ids: this.listIds,
      idName:"Id"
    };
    let sub = this.warehousesCustomerService.deleteListEntity(input).subscribe(
      (resonse) => {

        //reloadPage()
        this.getWarehousesCustomers();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  
  //#endregion
}
