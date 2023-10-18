import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { BankAccountServiceProxy } from '../../services/bank-account-services'
import { SharedService } from '../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../shared/interfaces/toolbar-path';
import { NotificationsAlertsService } from '../../../../shared/common-services/notifications-alerts.service';
import { ToolbarData } from '../../../../shared/interfaces/toolbar-data';
import { Subscription } from 'rxjs';
import { ITabulatorActionsSelected } from '../../../../shared/interfaces/ITabulator-action-selected';
import { MessageModalComponent } from '../../../../shared/components/message-modal/message-modal.component'
import { SettingMenuShowOptions } from '../../../../shared/components/models/setting-menu-show-options';
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-bank-account',
  templateUrl: './bank-account.component.html',
  styleUrls: ['./bank-account.component.scss']
})
export class BankAccountComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  bankAccount: any[] = [];
  currnetUrl: any;
  addUrl: string = '/accounting-master-codes/bankAccount/add-bankAccount';
  updateUrl: string = '/accounting-master-codes/bankAccount/update-bankAccount/';
  listUrl: string = '/accounting-master-codes/bankAccount';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.bankAccount"),
    componentAdd: '',

  };
  listIds: any[] = [];
  //#endregion

  //#region Constructor
  constructor(
    private bankAccountService: BankAccountServiceProxy,
    private router: Router,
    private sharedServices: SharedService,
    private alertsService: NotificationsAlertsService,
    private modalService: NgbModal,
    private translate: TranslateService,
    private spinner: NgxSpinnerService

  ) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
   // this.defineGridColumn();
    this.spinner.show();
    Promise.all([this.getBankAccounts()])
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
  getBankAccounts() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.bankAccountService.allBankAccountes(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.bankAccount");
          if (res.success) {
            this.bankAccount = res.response.items

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

  //#region CRUD master-codes
  delete(id: any) {
    this.bankAccountService.deleteBankAccount(id).subscribe((resonse) => {
      console.log('delet response', resonse);
      this.getBankAccounts();
    });
  }
  edit(id: string) {
    this.router.navigate([
      '/accounting-master-codes/bankAccount/update-bankAccount',
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

        let sub = this.bankAccountService.deleteBankAccount(id).subscribe(
          (resonse) => {

            //reloadPage()
            this.getBankAccounts();

          });
        this.subsList.push(sub);
        this.spinner.hide();

      }
    },err=>{
      this.spinner.hide();
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
    
    this.lang == 'ar'
      ? { title: ' الاسم', field: 'accountNameAr' } :
      { title: ' Name  ', field: 'accountNameEn' },

    {
      title: this.lang == 'ar' ? ' الكود' : 'code ',
      field: 'code',
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

  openBankAccountes() { }
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
      this.router.navigate(['accounting-master-codes/bankAccount/update-bankAccount/' + id])
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
        this.router.navigate(['accounting-master-codes/bankAccount/update-bankAccount/' + event.item.id])

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
    let sub = this.bankAccountService.deleteListBankAccount(ids).subscribe(
      (resonse) => {

        //reloadPage()
        this.getBankAccounts();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  //#endregion
}
