import { DeleteListSalesPersonCard, SalesPersonCardDto } from './../../models/sales-person-card';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { TranslateService } from '@ngx-translate/core';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { Subscription } from 'rxjs';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { ITabulatorActionsSelected } from 'src/app/shared/interfaces/ITabulator-action-selected';
import { SettingMenuShowOptions } from 'src/app/shared/components/models/setting-menu-show-options';
import { MessageModalComponent } from 'src/app/shared/components/message-modal/message-modal.component';
import { SalesPersonCardServiceProxy } from '../../Services/sales-person-card.service';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-sales-person-card',
  templateUrl: './sales-person-card.component.html',
  styleUrls: ['./sales-person-card.component.scss']
})
export class SalesPersonCardComponent implements OnInit,OnDestroy {

  //#region Main Declarations
  salesPersons: SalesPersonCardDto[] = [];
  currnetUrl: any;
  addUrl: string = '/warehouses-master-codes/sales-person-card/add-sales-person-card';
  updateUrl: string = '/warehouses-master-codes/sales-person-card/update-sales-person-card/';
  listUrl: string = '/warehouses-master-codes/sales-person-card';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.sales-person-card"),
    componentAdd: '',

  };

  listIds: any[] = [];
  //#endregion

  //#region Constructor
  constructor(
    private salesPersonCardService: SalesPersonCardServiceProxy,
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
    this.spinner.show();
    Promise.all([this.getsalesPersons()])
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
  getsalesPersons() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.salesPersonCardService.allSalesPersonCard(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.sales-person-card");
          if (res.success) {
            this.salesPersons = res.response.items

          }


          resolve();

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });

      this.subsList.push(sub);
    });

  }

  //#endregion

  //#region CRUD Operations
  delete(id: any) {
    this.salesPersonCardService.deleteSalesPersonCard(id).subscribe((resonse) => {
      this.getsalesPersons();
    });
  }
  edit(id: string) {
    this.router.navigate([
      '/warehouses-master-codes/sales-person-card/update-sales-person-card',
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
          tableName:"supplierCards",
          id:id,
          idName:"Id"
        };
        let sub = this.salesPersonCardService.deleteEntity(input).subscribe(
          (resonse) => {

            this.getsalesPersons();

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
      this.router.navigate(['warehouses-master-codes/sales-person-card/update-sales-person-card/' + id])
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
        this.router.navigate(['warehouses-master-codes/sales-person-card/update-sales-person-card/' + event.item.id])

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
    const input={
      tableName:"SalesPersonCards",
      ids: this.listIds,
      idName:"Id"
    };
    let sub = this.salesPersonCardService.deleteListEntity(input).subscribe(
      (resonse) => {

        //reloadPage()
        this.getsalesPersons();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  




}