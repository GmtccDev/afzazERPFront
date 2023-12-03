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
import { FiscalPeriodServiceProxy } from '../../services/fiscal-period.services';
import { ChequeStatusEnum, GeneralConfigurationEnum } from 'src/app/shared/constants/enumrators/enums';
import { GeneralConfigurationServiceProxy } from '../../services/general-configurations.services';
import { FiscalPeriodStatus } from 'src/app/shared/enum/fiscal-period-status';
import { ReportViewerService } from '../../reports/services/report-viewer.service';
import { DateCalculation } from 'src/app/shared/services/date-services/date-calc.service';
import { CompanyServiceProxy } from 'src/app/erp/master-codes/services/company.service';
import { stringIsNullOrEmpty } from 'src/app/shared/helper/helper';
import { AccountServiceProxy } from '../../services/account.services';
import { PublicService } from 'src/app/shared/services/public.service';
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
  printReportFormatIcon() { //plain text value

    return "<i class='fa fa-print' aria-hidden='true'></i>";
  };
  errorMessage = '';
  errorClass = '';
  routeAccountApi = 'Account/GetLeafAccounts?'
  account: any;
  listDetail: any[] = [];
  balance: number = 0;
  accountList: any;
  lang: string = localStorage.getItem("language");
  branchId: string = localStorage.getItem("branchId");
  companyId: string = localStorage.getItem("companyId");
  issuingCheque: any[] = [];
  filterIssuingCheque: any[] = [];

  fiscalPeriodId: number;
  fiscalPeriodName: string;
  fiscalPeriodStatus: number;
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
  dateType: any;
  accountExchangeId: any;

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
    private fiscalPeriodService: FiscalPeriodServiceProxy,
    private generalConfigurationService: GeneralConfigurationServiceProxy,
    private reportViewerService: ReportViewerService,
    private dateService: DateCalculation,
    private companyService: CompanyServiceProxy,
    private accountService: AccountServiceProxy,
    private publicService: PublicService,
  ) {

  }

  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    Promise.all([this.getGeneralConfigurationsOfFiscalPeriod(), this.getGeneralConfigurationsOfExchangeAccount(), this.getCompanyById(this.companyId), this.getIssuingChequees(), this.getAccount()])
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
  getAccount() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.accountList = res.response;

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
  getGeneralConfigurationsOfFiscalPeriod() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.getGeneralConfiguration(GeneralConfigurationEnum.AccountingPeriod).subscribe({
        next: (res: any) => {
          resolve();
          if (res.response.value > 0) {
            this.fiscalPeriodId = res.response.value;
            if (this.fiscalPeriodId != null) {
              this.getfiscalPeriodById(this.fiscalPeriodId);

            }
          }


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
  getGeneralConfigurationsOfExchangeAccount() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.getGeneralConfiguration(GeneralConfigurationEnum.AccountExchange).subscribe({
        next: (res: any) => {
          resolve();
          if (res.response.value > 0) {
            this.accountExchangeId = res.response.value;

          }


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
  getfiscalPeriodById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.fiscalPeriodService.getFiscalPeriod(id).subscribe({
        next: (res: any) => {
          resolve();
          this.fiscalPeriodName = this.lang == 'ar' ? res.response?.nameAr : res.response?.nameEn
          this.fiscalPeriodStatus = res.response?.fiscalPeriodStatus.toString()

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
  getIssuingChequees() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.issuingChequeService.allIssuingChequees(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          this.toolbarPathData.componentList = this.translate.instant("component-names.issuing-cheque");
          if (res.success) {
            this.issuingCheque = res.response.items.filter(x => x.branchId == this.branchId && x.companyId == this.companyId && x.fiscalPeriodId == this.fiscalPeriodId)
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
    var status;
    if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
      this.errorMessage = this.translate.instant("incoming-cheque.no-delete-cheque-fiscal-period-closed") + " : " + this.fiscalPeriodName;
      this.errorClass = 'errorMessage';
      this.alertsService.showWarning(this.errorMessage, this.translate.instant("message-title.warning"));
      return;
    }
    if (this.issuingCheque != null) {
      this.issuingCheque.forEach(element => {
        if (element.id == id) {
          status = element.status;
        }

      });

    }

    if (status == ChequeStatusEnum.Collected || status == ChequeStatusEnum.Rejected) {
      this.errorMessage = this.translate.instant("incoming-cheque.no-delete-cheque");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return;
    }
    else {
      const modalRef = this.modalService.open(MessageModalComponent);
      modalRef.componentInstance.message = this.translate.instant('messages.confirm-delete');
      modalRef.componentInstance.title = this.translate.instant('messageTitle.delete');
      modalRef.componentInstance.btnConfirmTxt = this.translate.instant('messageTitle.delete');
      modalRef.componentInstance.isYesNo = true;
      modalRef.result.then((rs) => {
        if (rs == 'Confirm') {
          if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
            this.errorMessage = this.translate.instant("incoming-cheque.no-delete-cheque-fiscal-period-closed") + " : " + this.fiscalPeriodName;
            this.errorClass = 'errorMessage';
            this.alertsService.showWarning(this.errorMessage, this.translate.instant("message-title.warning"));
            return;
          }
          else {
            this.spinner.show();

            let sub = this.issuingChequeService.deleteIssuingCheque(id).subscribe(
              (resonse) => {

                this.getIssuingChequees();

              });
            this.subsList.push(sub);
            this.spinner.hide();
          }

        }
      });
    }
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
    {
      title: this.lang == 'ar' ? ' تاريخ' : 'Date ',
      field: 'date', width: 300, formatter: (cell, formatterParams, onRendered) => {
        if (this.dateType == 2) {
          return this.dateService.getHijriDate(new Date(cell.getValue()));
        }
        else {
          return format(new Date(cell.getValue()), 'dd-MM-yyyy')

        }
      }
    },

    this.lang == 'ar'
      ? {
        title: 'الحالة', width: 300, field: 'status', formatter: this.translateStatusArEnum
      } : {
        title: 'Status', width: 300, field: 'status', formatter: this.translateStatusEnEnum
      },

    {
      title: this.lang == 'ar' ? ' تحصيل' : 'Collect',
      field: "", formatter: this.editFormatIcon, cellClick: (e, cell) => {
        if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
          this.errorMessage = this.translate.instant("incoming-cheque.no-collect-cheque-fiscal-period-closed") + " : " + this.fiscalPeriodName;
          this.errorClass = 'errorMessage';
          this.alertsService.showWarning(this.errorMessage, this.translate.instant("message-title.warning"));
          return;
        }
        else if (cell.getRow().getData().status == ChequeStatusEnum.Collected || cell.getRow().getData().status == ChequeStatusEnum.Rejected) {
          this.errorMessage = this.translate.instant("incoming-cheque.no-collect-cheque");
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;
        }
        else if (stringIsNullOrEmpty(this.accountExchangeId)) {
          this.errorMessage = this.translate.instant("general.account-exchange-required");
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;


        }
        else {
          this.showConfirmCollectMessage(cell.getRow().getData().id);
        }
      }
    },

    {
      title: this.lang == 'ar' ? ' الغاء تحصيل' : 'Cancel Collect ',
      field: '', formatter: this.editFormatIcon, cellClick: (e, cell) => {
        if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
          this.errorMessage = this.translate.instant("incoming-cheque.no-cancel-collect-cheque-fiscal-period-closed") + " : " + this.fiscalPeriodName;
          this.errorClass = 'errorMessage';
          this.alertsService.showWarning(this.errorMessage, this.translate.instant("message-title.warning"));
          return;
        }
        else if (cell.getRow().getData().status == ChequeStatusEnum.Collected) {
          this.showConfirmCancelCollectMessage(cell.getRow().getData().id);

        }
        else {
          this.errorMessage = this.translate.instant("incoming-cheque.no-cancel-collect-cheque");
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;
        }
      }
    },
    {
      title: this.lang == 'ar' ? ' رفض' : 'Reject',
      field: '', formatter: this.editFormatIcon, cellClick: (e, cell) => {
        if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
          this.errorMessage = this.translate.instant("incoming-cheque.no-reject-cheque-fiscal-period-closed") + " : " + this.fiscalPeriodName;
          this.errorClass = 'errorMessage';
          this.alertsService.showWarning(this.errorMessage, this.translate.instant("message-title.warning"));
          return;
        }
        else if (cell.getRow().getData().status == ChequeStatusEnum.Collected || cell.getRow().getData().status == ChequeStatusEnum.Rejected) {
          this.errorMessage = this.translate.instant("incoming-cheque.no-reject-cheque");
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;
        }
        else if (stringIsNullOrEmpty(this.accountExchangeId)) {
          this.errorMessage = this.translate.instant("general.account-exchange-required");
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;


        }
        else {
          this.showConfirmRejectMessage(cell.getRow().getData().id);
        }
      }
    },

    {
      title: this.lang == 'ar' ? ' الغاء رفض' : 'Cancel Reject ',
      field: '', formatter: this.editFormatIcon, cellClick: (e, cell) => {
        if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
          this.errorMessage = this.translate.instant("incoming-cheque.no-cancel-reject-cheque-fiscal-period-closed") + " : " + this.fiscalPeriodName;
          this.errorClass = 'errorMessage';
          this.alertsService.showWarning(this.errorMessage, this.translate.instant("message-title.warning"));
          return;
        }
        else if (cell.getRow().getData().status == ChequeStatusEnum.Rejected) {
          this.showConfirmCancelRejectMessage(cell.getRow().getData().id);
        }

        else {
          this.errorMessage = this.translate.instant("incoming-cheque.no-cancel-reject-cheque");
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;
        }
      }
    },

    {
      title: this.lang == 'ar' ? ' عرض التقرير' : 'View Report ',
      field: 'id', formatter: this.printReportFormatIcon, cellClick: (e, cell) => {
        this.onViewReportClicked(cell.getRow().getData().id);
      }
    },

  ];
  translateStatusArEnum(cell, formatterParams, onRendered) {
    const status = cell.getValue();
    let text;
    switch (status) {
      case 0:
        text = 'تم التسجيل';
        break;
      case 1:
        text = 'تم تعديل التسجيل';
        break;
      case 2:
        text = 'تم التحصيل';
        break;
      case 3:
        text = 'تم الرفض';
        break;

      case 4:
        text = 'تم الغاء التحصيل';
        break;

      case 5:
        text = 'تم الغاء الرفض';
        break;
    }
    return text;

  }
  translateStatusEnEnum(cell, formatterParams, onRendered) {
    const status = cell.getValue();
    let text;
    switch (status) {
      case 0:
        text = 'Registered';
        break;
      case 1:
        text = 'Edit Registered';
        break;
      case 2:
        text = 'Collected';
        break;
      case 3:
        text = 'Rejected';
        break;

      case 4:
        text = 'Cancelled the collect';
        break;

      case 5:
        text = 'Cancelled the reject';
        break;
    }
    return text;

  }
  getAccountBalance(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.accountService.getAccountBalance(id).subscribe({
        next: (res: any) => {
          resolve();

          this.balance = res.response.data.result[0].balance;


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
  getaccountById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.accountService.getAccount(id).subscribe({
        next: (res: any) => {
          resolve();
          this.account = res.response;



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
  showConfirmCancelCollectMessage(id: any) {
    const modalRef = this.modalService.open(MessageModalComponent);
    modalRef.componentInstance.message = this.translate.instant('incoming-cheque.confirm-cancel-collect');
    modalRef.componentInstance.title = this.translate.instant('general.confirm');
    modalRef.componentInstance.btnConfirmTxt = this.translate.instant('incoming-cheque.cancel-collect');

    modalRef.componentInstance.isYesNo = true;
    modalRef.result.then((rs) => {
      if (rs == 'Confirm') {
        this.spinner.show();
        let sub = this.issuingChequeService.cancelCollect(id).subscribe({
          next: (result: any) => {
            this.alertsService.showSuccess(
              this.translate.instant("incoming-cheque.cancel-collect-cheque-done"),
              ""
            )
            this.getIssuingChequees();

            return;

          },
          error: (err: any) => {
          },
          complete: () => {
          },
        });
        this.subsList.push(sub);

        this.spinner.hide();


      }
    });
  }
  showConfirmCancelRejectMessage(id: any) {
    const modalRef = this.modalService.open(MessageModalComponent);
    modalRef.componentInstance.message = this.translate.instant('incoming-cheque.confirm-cancel-reject');
    modalRef.componentInstance.title = this.translate.instant('general.confirm');
    modalRef.componentInstance.btnConfirmTxt = this.translate.instant('incoming-cheque.cancel-reject');

    modalRef.componentInstance.isYesNo = true;
    modalRef.result.then((rs) => {
      if (rs == 'Confirm') {
        this.spinner.show();

        let sub = this.issuingChequeService.cancelReject(id).subscribe({
          next: (result: any) => {
            this.alertsService.showSuccess(
              this.translate.instant("incoming-cheque.cancel-reject-cheque-done"),
              ""
            )
            this.getIssuingChequees();

            return;

          },
          error: (err: any) => {
          },
          complete: () => {
          },
        });
        this.subsList.push(sub);
        this.spinner.hide();


      }
    });
  }
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
    if (this.issuingCheque != null) {
      this.filterIssuingCheque = this.issuingCheque.filter(x => x.id == id);
      if (!(this.filterIssuingCheque[0].status == ChequeStatusEnum.Collected || this.filterIssuingCheque[0].status == ChequeStatusEnum.Rejected)) {

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
      else {

        this.errorMessage = this.translate.instant("incoming-cheque.no-delete-cheque");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }
    }
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
        if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
          this.errorMessage = this.translate.instant("incoming-cheque.no-delete-cheque-fiscal-period-closed") + " : " + this.fiscalPeriodName;
          this.errorClass = 'errorMessage';
          this.alertsService.showWarning(this.errorMessage, this.translate.instant("message-title.warning"));
          return;
        }
        else if (event.item.status == ChequeStatusEnum.Collected || event.item.status == ChequeStatusEnum.Rejected) {
          this.errorMessage = this.translate.instant("incoming-cheque.no-delete-cheque");
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;
        }
        else {

          this.showConfirmDeleteMessage(event.item.id);
        }
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
            if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
              this.errorMessage = this.translate.instant("incoming-cheque.no-delete-cheque-fiscal-period-closed") + " : " + this.fiscalPeriodName;
              this.errorClass = 'errorMessage';
              this.alertsService.showWarning(this.errorMessage, this.translate.instant("message-title.warning"));
              return;
            }
            else {
              this.onDelete();
            }
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  onDelete() {
    var ids = this.listIds.map(item => item.id);
    if (ids != null && ids.length > 0) {
      let sub = this.issuingChequeService.deleteListIssuingCheque(ids).subscribe(
        (resonse) => {

          this.getIssuingChequees();
          this.listIds = [];
        });
      this.subsList.push(sub);
    }
  }
  //#endregion
  showConfirmCollectMessage(id: any) {
    // var i = 0;
    // this.getAccountBalance(obj.bankAccountId).then(a => {
    //   debugger
    //   var account = this.accountList.find(x => x.id == obj.bankAccountId);
    //   var accountName = this.lang == 'ar' ? account.nameAr : account.nameEn;

    //   if (Number(this.balance) > 0 && account.debitLimit > 0) {

    //     if (Number(this.balance) + obj.amountLocal > account.debitLimit) {
    //       debugger

    //       this.errorMessage = this.translate.instant('general.debit-limit-exceed-account') + " : " + accountName + this.translate.instant('general.code') + " : " + account.code;
    //       this.errorClass = 'errorMessage';
    //       this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
    //       i++;
    //     }

    //   }
    //   else if (Number(this.balance) < 0 && account.creditLimit > 0) {

    //     if (-(this.balance) + obj.amountLocal > account.creditLimit) {
    //       debugger
    //       this.errorMessage = this.translate.instant('general.credit-limit-exceed-account') + " : " + accountName + this.translate.instant('general.code') + " : " + account.code;
    //       this.errorClass = 'errorMessage';
    //       this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
    //       i++;
    //     }


    //   }
    // }).catch(err => {

    // });

    // this.getAccountBalance(this.accountExchangeId).then(a => {
    //   var account = this.accountList.find(x => x.id == this.accountExchangeId);
    //   var accountName = this.lang == 'ar' ? account.nameAr : account.nameEn;
    //   debugger
    //   if (Number(this.balance) > 0 && account.debitLimit > 0) {
    //     debugger
    //     if (Number(this.balance) + obj.amountLocal > account.debitLimit) {
    //       debugger

    //       this.errorMessage = this.translate.instant('general.debit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('accounting-configration.account-exchange') + ")" + this.translate.instant('general.code') + " : " + account.code;          
    //       this.errorClass = 'errorMessage';
    //       this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
    //       i++;
    //     }

    //   }
    //   else if (Number(this.balance) < 0 && account.creditLimit > 0) {
    //     debugger
    //     if (-(this.balance) + obj.amountLocal > account.creditLimit) {
    //       debugger
    //       this.errorMessage = this.translate.instant('general.credit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('accounting-configration.account-exchange') + ")" + this.translate.instant('general.code') + " : " + account.code;          
    //       this.errorClass = 'errorMessage';
    //       this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
    //       i++;
    //     }


    //   }
    // }).catch(err => {

    // });
    // setTimeout(() => {
    //   if (i == 0) {
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
                this.alertsService.showSuccess(
                  this.translate.instant("incoming-cheque.collect-cheque-done"),
                  ""
                )
                this.getIssuingChequees();

                return;

              },
              error: (err: any) => {
              },
              complete: () => {
              },
            });
            this.subsList.push(sub);
            this.spinner.hide();


          }
        });
    //   }
    // }, 1000);
  }
  showConfirmRejectMessage(id: any) {
    // var i = 0;
    // this.getissuingChequeById(obj.id).then(a => {
    //   this.listDetail.forEach(
    //     element => {
    //       if (element.accountId != null) {
    //         var value = 0;
    //         if (element.jEDetailDebitLocal > 0) {
    //           value = element.jEDetailDebitLocal;
    //         }
    //         if (element.jEDetailCreditLocal > 0) {
    //           value = element.jEDetailCreditLocal;

    //         }

    //         this.getAccountBalance(element.accountId).then(a => {
    //           var account = this.accountList.find(x => x.id == element.accountId);

    //           var accountName = this.lang == 'ar' ? account.nameAr : account.nameEn;

    //           if (Number(this.balance) > 0 && account.debitLimit > 0) {

    //             if (Number(this.balance) + value > account.debitLimit) {
    //               this.errorMessage = this.translate.instant('general.debit-limit-exceed-account') + " : " + accountName + this.translate.instant('general.code') + " : " + account.code;          
    //               this.errorClass = 'errorMessage';
    //               this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
    //               i++;
    //             }

    //           }
    //           else if (Number(this.balance) < 0 && account.creditLimit > 0) {

    //             if (-(this.balance) + value > account.creditLimit) {

    //               this.errorMessage = this.translate.instant('general.credit-limit-exceed-account') + " : " + accountName + this.translate.instant('general.code') + " : " + account.code;          
    //               this.errorClass = 'errorMessage';
    //               this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
    //               i++;
    //             }
    //           }
    //         });
    //       }

    //     }
    //   )


    // }).catch(err => {

    // });
    // this.getAccountBalance(this.accountExchangeId).then(a => {
    //   var account = this.accountList.find(x => x.id == this.accountExchangeId);
    //   var accountName = this.lang == 'ar' ? account.nameAr : account.nameEn;
    //   debugger
    //   if (Number(this.balance) > 0 && account.debitLimit > 0) {
    //     debugger
    //     if (Number(this.balance) + obj.amountLocal > account.debitLimit) {
    //       debugger

    //       this.errorMessage = this.translate.instant('general.debit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('accounting-configration.account-exchange') + ")" + this.translate.instant('general.code') + " : " + account.code;          
    //       this.errorClass = 'errorMessage';
    //       this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
    //       i++;
    //     }

    //   }
    //   else if (Number(this.balance) < 0 && account.creditLimit > 0) {
    //     debugger
    //     if (-(this.balance) + obj.amountLocal > account.creditLimit) {
    //       debugger
    //       this.errorMessage = this.translate.instant('general.credit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('accounting-configration.account-exchange') + ")" + this.translate.instant('general.code') + " : " + account.code;          
    //       this.errorClass = 'errorMessage';
    //       this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
    //       i++;
    //     }


    //   }
    // }).catch(err => {

    // });


    // setTimeout(() => {
    //   if (i == 0) {
        const modalRef = this.modalService.open(MessageModalComponent);
        modalRef.componentInstance.message = this.translate.instant('incoming-cheque.confirm-reject');
        modalRef.componentInstance.title = this.translate.instant('general.confirm');
        modalRef.componentInstance.btnConfirmTxt = this.translate.instant('incoming-cheque.reject');

        modalRef.componentInstance.isYesNo = true;
        modalRef.result.then((rs) => {
          if (rs == 'Confirm') {
            this.spinner.show();
            let sub = this.issuingChequeService.reject(id).subscribe({
              next: (result: any) => {
                this.alertsService.showSuccess(
                  this.translate.instant("incoming-cheque.reject-cheque-done"),
                  ""
                )
                this.getIssuingChequees();

                return;

              },
              error: (err: any) => {
              },
              complete: () => {
              },
            });
            this.subsList.push(sub);
            this.spinner.hide();
          }
        });

    //   }
    // }, 1000)
  }
  getissuingChequeById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.issuingChequeService.getIssuingCheque(id).subscribe({
        next: (res: any) => {
          resolve();
          this.listDetail = res.response?.issuingChequeDetail;
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
  onViewReportClicked(id) {
    // let reportParams: string =
    //   "reportParameter=id!" + id
    //   + "&reportParameter=lang!" + this.lang
    // const modalRef = this.modalService.open(NgbdModalContent);
    // modalRef.componentInstance.reportParams = reportParams;
    // modalRef.componentInstance.reportType = 1;
    // modalRef.componentInstance.reportTypeID = 10;
    let reportType = 1;
    let reportTypeId = 10;
    this.reportViewerService.gotoViewer(reportType, reportTypeId, id);
  }
  getCompanyById(id: any) {
    return new Promise<void>((resolve, reject) => {

      let sub = this.companyService.getCompany(id).subscribe({
        next: (res: any) => {
          res?.response?.useHijri
          if (res?.response?.useHijri) {
            this.dateType = 2
          } else {
            this.dateType = 1
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
}
