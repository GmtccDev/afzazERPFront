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
import { IncomingChequeServiceProxy } from '../../services/incoming-cheque.services'
import format from 'date-fns/format';
import { NgxSpinnerService } from 'ngx-spinner';
import { FiscalPeriodServiceProxy } from '../../services/fiscal-period.services';
import { GeneralConfigurationEnum } from 'src/app/shared/constants/enumrators/enums';
import { GeneralConfigurationServiceProxy } from '../../services/general-configurations.services';
import { FiscalPeriodStatus } from 'src/app/shared/enum/fiscal-period-status';
import { ReportViewerService } from '../../reports/services/report-viewer.service';
import { CompanyServiceProxy } from 'src/app/erp/master-codes/services/company.service';
import { DateCalculation } from 'src/app/shared/services/date-services/date-calc.service';
@Component({
  selector: 'app-incoming-cheque',
  templateUrl: './incoming-cheque.component.html',
  styleUrls: ['./incoming-cheque.component.scss']
})
export class IncomingChequeComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  editFormatIcon() { //plain text value
    return "<i class=' fa fa-edit'></i>";
  };
  printReportFormatIcon() { //plain text value

    return "<i class='fa fa-print' aria-hidden='true'></i>";
  };
  errorMessage = '';
  errorClass = '';
  lang: string = localStorage.getItem("language");
  branchId: string = localStorage.getItem("branchId");
  companyId: string = localStorage.getItem("companyId");
  incomingCheque: any[] = [];
  currnetUrl: any;
  fiscalPeriodId: number;
  fiscalPeriodName: string;
  fiscalPeriodStatus: number;
  addUrl: string = '/accounting-operations/incomingCheque/add-incomingCheque';
  updateUrl: string = '/accounting-operations/incomingCheque/update-incomingCheque/';
  listUrl: string = '/accounting-operations/incomingCheque';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.incomingCheque"),
    componentAdd: '',

  };
  listIds: any[] = [];
  dateType: any;
  //#endregion

  //#region Constructor
  constructor(
    private incomingChequeService: IncomingChequeServiceProxy,
    private router: Router,
    private sharedServices: SharedService,
    private alertsService: NotificationsAlertsService,
    private modalService: NgbModal,
    private translate: TranslateService,
    private spinner: NgxSpinnerService,
    private fiscalPeriodService: FiscalPeriodServiceProxy,
    private generalConfigurationService: GeneralConfigurationServiceProxy,
    private reportViewerService: ReportViewerService,
    private companyService: CompanyServiceProxy,
    private dateService: DateCalculation,



  ) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    Promise.all([this.getGeneralConfigurationsOfFiscalPeriod(),this.getCompanyById(this.companyId), this.getIncomingChequees()])
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
  getIncomingChequees() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.incomingChequeService.allIncomingChequees(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          this.toolbarPathData.componentList = this.translate.instant("component-names.incomingCheque");
          if (res.success) {
            this.incomingCheque = res.response.items.filter(x => x.branchId == this.branchId && x.companyId == this.companyId && x.fiscalPeriodId == this.fiscalPeriodId)

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
    this.incomingChequeService.deleteIncomingCheque(id).subscribe((resonse) => {
      this.getIncomingChequees();
    });
  }
  edit(id: string) {

    this.router.navigate([
      '/accounting-operations/incomingCheque/update-incomingCheque',
      id,
    ]);
  }

  //#endregion



  showConfirmDeleteMessage(id: any) {
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
          let sub = this.incomingChequeService.deleteIncomingCheque(id).subscribe(
            (resonse) => {

              this.getIncomingChequees();

            });
          this.subsList.push(sub);
          this.spinner.hide();
        }

      }
    });
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
    this.lang == 'ar'
      ? {
        title: '  تاريخ  ', width: 300, field: 'date', formatter:  (cell, formatterParams, onRendered) => {
          if (this.dateType == 2) {
						return this.dateService.getHijriDate(new Date(cell.getValue()));
					}
					else {
						return format(new Date(cell.getValue()), 'dd-MM-yyyy')

					}
        }
      } : {
        title: 'Date', width: 300, field: 'date', formatter:  (cell, formatterParams, onRendered)=>{
          if (this.dateType == 2) {
						return this.dateService.getHijriDate(new Date(cell.getValue()));
					}
					else {
						return format(new Date(cell.getValue()), 'dd-MM-yyyy')

					}
        }
      },
    this.lang == "ar" ? {
      title: "تحصيل",
      field: "", formatter: this.editFormatIcon, cellClick: (e, cell) => {
        if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
          this.errorMessage = this.translate.instant("incoming-cheque.no-collect-cheque-fiscal-period-closed") + " : " + this.fiscalPeriodName;
          this.errorClass = 'errorMessage';
          this.alertsService.showWarning(this.errorMessage, this.translate.instant("message-title.warning"));
          return;
        }
        else {
          this.showConfirmCollectMessage(cell.getRow().getData().id);
        }
      }
    } :
      {
        title: "Collect",
        field: "", formatter: this.editFormatIcon, cellClick: (e, cell) => {
          if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
            this.errorMessage = this.translate.instant("incoming-cheque.no-collect-cheque-fiscal-period-closed") + " : " + this.fiscalPeriodName;
            this.errorClass = 'errorMessage';
            this.alertsService.showWarning(this.errorMessage, this.translate.instant("message-title.warning"));
            return;
          }
          else {
            this.showConfirmCollectMessage(cell.getRow().getData().id);
          }
        },
      },
    this.lang == "ar" ? {
      title: "رفض",
      field: "", formatter: this.editFormatIcon, cellClick: (e, cell) => {
        if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
          this.errorMessage = this.translate.instant("incoming-cheque.no-reject-cheque-fiscal-period-closed") + " : " + this.fiscalPeriodName;
          this.errorClass = 'errorMessage';
          this.alertsService.showWarning(this.errorMessage, this.translate.instant("message-title.warning"));
          return;
        }
        else {
          this.showConfirmRejectMessage(cell.getRow().getData().id);
        }
      }
    } :
      {
        title: "Reject",
        field: "", formatter: this.editFormatIcon, cellClick: (e, cell) => {
          if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
            this.errorMessage = this.translate.instant("incoming-cheque.no-reject-cheque-fiscal-period-closed") + " : " + this.fiscalPeriodName;
            this.errorClass = 'errorMessage';
            this.alertsService.showWarning(this.errorMessage, this.translate.instant("message-title.warning"));
            return;
          }
          else {
            this.showConfirmRejectMessage(cell.getRow().getData().id);
          }
        },
      },
    this.lang == "ar" ? {
      title: "عرض التقرير",
      field: "id", formatter: this.printReportFormatIcon, cellClick: (e, cell) => {

        this.onViewReportClicked(cell.getRow().getData().id);
      }
    }
      :

      {
        title: "View Report",
        field: "id", formatter: this.printReportFormatIcon, cellClick: (e, cell) => {


          this.onViewReportClicked(cell.getRow().getData().id);
        }
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

  openIncomingChequees() { }
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
      this.router.navigate(['accounting-operations/incomingCheque/update-incomingCheque/' + id])
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
        this.router.navigate(['accounting-operations/incomingCheque/update-incomingCheque/' + event.item.id])

      } else if (event.actionName == 'Delete') {
        if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
          this.errorMessage = this.translate.instant("incoming-cheque.no-delete-cheque-fiscal-period-closed") + " : " + this.fiscalPeriodName;
          this.errorClass = 'errorMessage';
          this.alertsService.showWarning(this.errorMessage, this.translate.instant("message-title.warning"));
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
    let sub = this.incomingChequeService.deleteListIncomingCheque(ids).subscribe(
      (resonse) => {

        this.getIncomingChequees();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  //#endregion
  showConfirmCollectMessage(id: any) {
    const modalRef = this.modalService.open(MessageModalComponent);
    modalRef.componentInstance.message = this.translate.instant('incoming-cheque.confirm-collect');
    modalRef.componentInstance.title = this.translate.instant('general.confirm');
    modalRef.componentInstance.btnConfirmTxt = this.translate.instant('incoming-cheque.collect');

    modalRef.componentInstance.isYesNo = true;
    modalRef.result.then((rs) => {
      if (rs == 'Confirm') {
        this.spinner.show();
        let sub = this.incomingChequeService.collect(id).subscribe({
          next: (result: any) => {
            this.alertsService.showSuccess(
              this.translate.instant("incoming-cheque.collect-cheque-done"),
              ""
            )
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
  showConfirmRejectMessage(id: any) {
    const modalRef = this.modalService.open(MessageModalComponent);
    modalRef.componentInstance.message = this.translate.instant('incoming-cheque.confirm-reject');
    modalRef.componentInstance.title = this.translate.instant('general.confirm');
    modalRef.componentInstance.btnConfirmTxt = this.translate.instant('incoming-cheque.reject');

    modalRef.componentInstance.isYesNo = true;
    modalRef.result.then((rs) => {
      if (rs == 'Confirm') {
        this.spinner.show();

        let sub = this.incomingChequeService.reject(id).subscribe({
          next: (result: any) => {
            this.alertsService.showSuccess(
              this.translate.instant("incoming-cheque.reject-cheque-done"),
              ""
            )
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
  onViewReportClicked(id) {
    // let reportParams: string =
    //   "reportParameter=id!" + id
    //   + "&reportParameter=lang!" + this.lang
    // const modalRef = this.modalService.open(NgbdModalContent);
    // modalRef.componentInstance.reportParams = reportParams;
    // modalRef.componentInstance.reportType = 1;
    // modalRef.componentInstance.reportTypeID = 9;

    let reportType = 1;
    let reportTypeId = 9;
    this.reportViewerService.gotoViewer(reportType, reportTypeId, id);
  }
  getCompanyById(id: any) {
		return new Promise<void>((resolve, reject) => {

			let sub = this.companyService.getCompany(id).subscribe({
				next: (res: any) => {
					debugger;

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
