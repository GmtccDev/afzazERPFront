import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
import { VoucherTypeServiceProxy } from '../../../Accounting/services/voucher-type.service';
import { format } from 'date-fns';
import { FiscalPeriodServiceProxy } from '../../../Accounting/services/fiscal-period.services';
import { NotificationsAlertsService } from '../../../../shared/common-services/notifications-alerts.service';
import { GeneralConfigurationEnum } from '../../../../shared/constants/enumrators/enums';
import { FiscalPeriodStatus } from '../../../../shared/enum/fiscal-period-status';
import { TabulatorComponent } from '../../../../shared/components/tabulator/tabulator/tabulator.component';
import { DateCalculation } from '../../../../shared/services/date-services/date-calc.service';
import { AccountingPeriodServiceProxy } from '../../../Accounting/services/accounting-period.service';
import {VoucherServiceProxy} from '../../../Accounting/services/voucher.service';
import {ReportViewerService} from '../../../Accounting/reports/services/report-viewer.service';
import {GeneralConfigurationServiceProxy} from '../../../Accounting/services/general-configurations.services';
import {CompanyServiceProxy} from '../../../master-codes/services/company.service';
import { SettingMenuShowOptions } from '../../../../shared/components/models/setting-menu-show-options';


@Component({
  selector: 'app-simple-voucher',
  templateUrl: './simple-voucher.component.html',
  styleUrls: ['./simple-voucher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleVoucherComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  simpleVouchers: any[] = [];
  voucherType: any[] = [];
  voucherTypeId: any;
  currnetUrl: any;
  queryParams: any;
  fiscalPeriodId: number;
  fiscalPeriodName: string;
  fiscalPeriodStatus: number;
  errorMessage = '';
  errorClass = '';
  lang: any = localStorage.getItem("language");
  branchId: any = localStorage.getItem("branchId");
  companyId: any = localStorage.getItem("companyId");
  addUrl: string = '/warehouses-operations/simpleVoucher/add-simpleVoucher/';
  updateUrl: string = '/warehouses-operations/simpleVoucher/update-simpleVoucher/';
  listUrl: string = '/warehouses-operations/simpleVoucher/';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.simple-vouchers"),
    componentAdd: '',

  };
  listIds: any[] = [];
  tabular: any;
  dateType: any;
  accountingPeriods: any;
  accountingPeriodCheckDate: any;

  //#endregion
  @ViewChild(TabulatorComponent) child;

  //#region Constructor
  constructor(
    private voucherService: VoucherServiceProxy,
    private router: Router,
    private route: ActivatedRoute,
    private sharedServices: SharedService,
    private modalService: NgbModal,
    private translate: TranslateService,
    private spinner: NgxSpinnerService,
    private reportViewerService: ReportViewerService,
    private voucherTypeService: VoucherTypeServiceProxy,
    private generalConfigurationService: GeneralConfigurationServiceProxy,
    private fiscalPeriodService: FiscalPeriodServiceProxy,
    private alertsService: NotificationsAlertsService,
    private cd: ChangeDetectorRef,
    private companyService: CompanyServiceProxy,
    private dateService: DateCalculation,
    private accountingPeriodServiceProxy: AccountingPeriodServiceProxy,



  ) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

    this.simpleVouchers = [];

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    if (!localStorage.getItem('foo')) {
      localStorage.setItem('foo', 'no reload')
      location.reload()

    } else {
      localStorage.removeItem('foo')

    }

    let sub = this.route.params.subscribe(params => {
      if (params['voucherTypeId'] != null) {

        this.voucherTypeId = +params['voucherTypeId'];
        this.getVoucherTypes(this.voucherTypeId);


      }
    })
    this.subsList.push(sub);
    this.spinner.show();


    Promise.all([this.getGeneralConfigurationsOfFiscalPeriod(), this.getCompanyById(this.companyId), this.getSimpleVouchers()])
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
  getGeneralConfigurationsOfFiscalPeriod() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.getGeneralConfiguration(GeneralConfigurationEnum.AccountingPeriod).subscribe({
        next: (res: any) => {
          resolve();
          if (res.response.value > 0) {
            this.fiscalPeriodId = res.response.value;
            if (this.fiscalPeriodId != null) {
              this.getfiscalPeriodById(this.fiscalPeriodId);
              this.getClosedAccountingPeriodsByFiscalPeriodId(this.fiscalPeriodId);

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
  //#endregion

  getSimpleVouchers() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherService.allVouchers(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          if (res.success) {

            this.simpleVouchers = res.response.items.filter(x => x.voucherTypeId == this.voucherTypeId && x.branchId == this.branchId && x.companyId == this.companyId && x.fiscalPeriodId == this.fiscalPeriodId)
            this.simpleVouchers = [...this.simpleVouchers];
            this.cd.detectChanges();


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
    this.voucherService.deleteVoucher(this.voucherTypeId, id).subscribe((resonse) => {
      this.getSimpleVouchers();
      this.router.navigate([this.listUrl + this.voucherTypeId])
        .then(() => {
          window.location.reload();
        });
    });
  }
  edit(id: string) {

    this.router.navigate([
      '/warehouses-operations/simpleVouchers/update-simpleVoucher/',
      this.voucherTypeId, id,
    ]);
  }

  //#endregion



  showConfirmDeleteMessage(id) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherService.getVoucher(id).subscribe({
        next: (res: any) => {
          resolve();

          if (this.fiscalPeriodStatus == FiscalPeriodStatus.Opened) {

            let _date = res.response.voucherDate;
            if (this.accountingPeriods != null) {
              this.accountingPeriodCheckDate = this.accountingPeriods.find(x => x.fromDate <= _date && x.toDate >= _date);
              if (this.accountingPeriodCheckDate != undefined) {
                this.errorMessage = this.translate.instant("general.date-in-closed-accounting-period");
                this.errorClass = 'errorMessage';
                this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
                return;
              }
            }
          }
          const modalRef = this.modalService.open(MessageModalComponent);
          modalRef.componentInstance.message = this.translate.instant('messages.confirm-delete');
          modalRef.componentInstance.title = this.translate.instant('messageTitle.delete');
          modalRef.componentInstance.btnConfirmTxt = this.translate.instant('messageTitle.delete');
          modalRef.componentInstance.isYesNo = true;
          modalRef.result.then((rs) => {
            if (rs == 'Confirm') {
              if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
                this.errorMessage = this.translate.instant("voucher.no-delete-voucher-fiscal-period-closed") + " : " + this.fiscalPeriodName;
                this.errorClass = 'errorMessage';
                this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
                return;
              }
              else {

                this.spinner.show();
                let sub = this.voucherService.deleteVoucher(this.voucherTypeId, id).subscribe(
                  (resonse) => {
                    this.getSimpleVouchers();
                    this.router.navigate([this.listUrl + this.voucherTypeId])

                  });
                this.subsList.push(sub);
                this.spinner.hide();
              }
            }
          })
        }
      }
      )
    }
    )
  }
  //#endregion
  //#region Tabulator

  panelId: number = 1;
  sortByCols: any[] = [];
  searchFilters: any;
  groupByCols: string[] = [];
  

  columnNames = [
    {
      title: this.lang == 'ar' ? ' كود' : 'Code ',
      field: 'code',
    },
    {
      title: this.lang == 'ar' ? ' تاريخ' : 'Date ',
      field: 'voucherDate', width: 300, formatter: (cell, formatterParams, onRendered) => {
        if (this.dateType == 2) {
          return this.dateService.getHijriDate(new Date(cell.getValue()));
        }
        else {
          return format(new Date(cell.getValue()), 'dd-MM-yyyy')

        }
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
    {
      title: this.lang == 'ar' ? "عرض التقرير" : "View Report",
      field: 'id', formatter: this.printReportFormatIcon, cellClick: (e, cell) => {

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
        { field: 'code', type: 'like', value: searchTxt },
        { field: 'voucherTotal', type: 'like', value: searchTxt },
        { field: 'description', type: 'like', value: searchTxt },

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
        if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
          this.errorMessage = this.translate.instant("voucher.no-delete-voucher-fiscal-period-closed") + " : " + this.fiscalPeriodName;
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

            this.router.navigate([this.addUrl + this.voucherTypeId]);

          }
          else if (currentBtn.action == ToolbarActions.DeleteCheckList) {
            if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
              this.errorMessage = this.translate.instant("voucher.no-delete-voucher-fiscal-period-closed") + " : " + this.fiscalPeriodName;
              this.errorClass = 'errorMessage';
              this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
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
    let sub = this.voucherService.deleteListVoucher(ids).subscribe(
      (resonse) => {
        this.router.navigate([this.listUrl + this.voucherTypeId])
          .then(() => {
            window.location.reload();
          });
        this.getSimpleVouchers();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  //#endregion

  onViewReportClicked(id) {

    this.checkPrintPermission().then(a => {
      if (a) {
        localStorage.removeItem("itemId")
        localStorage.setItem("itemId", id)
        let reportType = 1;
        let reportTypeId = 11;
        this.reportViewerService.gotoViewer(reportType, reportTypeId, id);
      }
    })


  }

  checkPrintPermission() {
    return new Promise<boolean>((resolve, reject) => {
      let sub = this.voucherService.checkPrintPermission(this.voucherTypeId).subscribe({
        next: (res) => {

          if (res.status == "Success") {
            resolve(true);
          }
          else {
            resolve(false);
          }

        },
        error: (err) => {
          resolve(false);
        },
        complete: () => { }
      });
      this.subsList.push(sub);
    })
  }
  printReportFormatIcon() { //plain text value

    return "<i class='fa fa-print' aria-hidden='true'></i>";
  };
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
        },
      });
      this.subsList.push(sub);

    });
  }
  getClosedAccountingPeriodsByFiscalPeriodId(fiscalPeriodId: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.accountingPeriodServiceProxy.allAccountingPeriods(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          if (res.success) {
            this.accountingPeriods = res.response.items.filter(x => x.companyId == this.companyId && x.fiscalPeriodId == fiscalPeriodId);
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
}
