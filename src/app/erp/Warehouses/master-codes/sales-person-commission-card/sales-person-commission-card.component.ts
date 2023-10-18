import { SalesPersonCommissionCardDto } from './../../models/sales-person-commission-card';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { MessageModalComponent } from 'src/app/shared/components/message-modal/message-modal.component';
import { SettingMenuShowOptions } from 'src/app/shared/components/models/setting-menu-show-options';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { ITabulatorActionsSelected } from 'src/app/shared/interfaces/ITabulator-action-selected';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { SalesPersonCommissionServiceProxy } from '../../Services/sales-person-commission.service';
import { Subscription } from 'rxjs';
import { DeleteListSalesPersonCard } from '../../models/sales-person-card';

@Component({
  selector: 'app-sales-person-commission-card',
  templateUrl: './sales-person-commission-card.component.html',
  styleUrls: ['./sales-person-commission-card.component.scss']
})
export class SalesPersonCommissionCardComponent implements OnInit, OnDestroy {

  //#region Main Declarations
  salesPersonsCommissions: SalesPersonCommissionCardDto[] = [];

  currnetUrl: any;
  addUrl: string = '/warehouses-master-codes/sales-person-commission-card/add-sales-person-commission-card';
  updateUrl: string = '/warehouses-master-codes/sales-person-commission-card/update-sales-person-commission-card/';
  listUrl: string = '/warehouses-master-codes/sales-person-commission-card';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.sales-person-commission"),
    componentAdd: '',

  };

  listIds: any[] = [];
  //#endregion

  //#region Constructor
  constructor(
    private salesPersonCommissionServiceProxy: SalesPersonCommissionServiceProxy,
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
    Promise.all([this.getSalesPersonsCommissions()])
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
  getSalesPersonsCommissions() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.salesPersonCommissionServiceProxy.allSalesPersonCommission(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.sales-person-commission");
          if (res.success) {
            this.salesPersonsCommissions = res.response.items

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
    this.salesPersonCommissionServiceProxy.deleteSalesPersonCommission(id).subscribe((resonse) => {
      this.getSalesPersonsCommissions();
    });
  }
  edit(id: string) {
    this.router.navigate([
      '/warehouses-master-codes/sales-person-card/update-sales-person-commission-card',
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
          tableName: "SalesPersonsCommissions",
          id: id,
          idName: "Id"
        };
        let sub = this.salesPersonCommissionServiceProxy.deleteEntity(input).subscribe(
          (resonse) => {

            this.getSalesPersonsCommissions();

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


    {
      title: this.lang == 'ar' ? ' الكود' : 'Code ',
      field: 'code',
    },
 
    this.lang == 'ar'
      ? {
        title: '  طريقة الحساب', width: 200, field: 'calculationMethod', formatter: this.translateCalcMethodArEnum
      } : {
        title: '   Calculation Method', width: 200, field: 'calculationMethod', formatter: this.translateCalcMethodEnEnum
      },
      this.lang == 'ar'
      ? {
        title: 'نوع العمولة', width: 200, field: 'type', formatter: this.translateCommissionTypeArEnum
      } : {
        title: ' Commission Type', width: 200, field: 'type', formatter: this.translateCommissionTypeEnEnum
      },
  
    {
      title: this.lang == 'ar' ? 'المستهدف' : 'Target',
      field: 'target',
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
        { field: 'calculationMethod', type: 'like', value: searchTxt },
        { field: 'type', type: 'like', value: searchTxt },
        { field: 'target', type: 'like', value: searchTxt }

        ,
      ],
    ];
  }
  translateCommissionTypeArEnum(cell, formatterParams, onRendered) {

    const calculationMethod = cell.getValue();
    let text;
    switch (calculationMethod) {
      case 1:
        text = 'شهرية';
        break;
      case 2:
        text = 'ربع شهرية ';
        break;
      case 3:
        text = 'نصف سنوية ';
        break;
      case 4:
        text = ' سنوية ';
        break;

      default:
        text = calculationMethod;
        break;
    }
    return text;

  }
  translateCommissionTypeEnEnum(cell, formatterParams, onRendered) {

    const calculationMethod = cell.getValue();
    let text;
    switch (calculationMethod) {
      case 1:
        text = 'Monthly';
        break;
      case 2:
        text = 'Quarterly ';
        break;
      case 3:
        text = 'Semi Annual  ';
        break;
      case 4:
        text = ' Annually ';
        break;

      default:
        text = calculationMethod;
        break;
    }
    return text;

  }
  translateCalcMethodArEnum(cell, formatterParams, onRendered) {

    const commissionType = cell.getValue();
    let text;
    switch (commissionType) {
      case 1:
        text = 'قيمة ثابتة';
        break;
      case 2:
        text = 'تحسب بناء على عمر التحصيل';
        break;
 

      default:
        text = commissionType;
        break;
    }
    return text;

  }
  translateCalcMethodEnEnum(cell, formatterParams, onRendered) {

    const commissionType = cell.getValue();
    let text;
    switch (commissionType) {
      case 1:
        text = 'Fix Amount';
        break;
      case 2:
        text = 'As per age of collection ';
        break;
 
      default:
        text = commissionType;
        break;
    }
    return text;

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
      this.router.navigate(['warehouses-master-codes/sales-person-commission-card/update-sales-person-commission-card/' + id])
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
        this.router.navigate(['warehouses-master-codes/sales-person-commission-card/update-sales-person-commission-card/' + event.item.id])

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

    let item = new DeleteListSalesPersonCard();
    item.ids = this.listIds.map(item => item.id);
    const input = {
      tableName: "SalesPersonsCommissions",
      ids: this.listIds,
      idName: "Id"
    };
    let sub = this.salesPersonCommissionServiceProxy.deleteListEntity(input).subscribe(
      (resonse) => {

        //reloadPage()
        this.getSalesPersonsCommissions();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }



}
