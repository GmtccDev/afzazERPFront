import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions';
import { ToolbarData } from '../../../../shared/interfaces/toolbar-data';
import { ToolbarPath } from '../../../../shared/interfaces/toolbar-path';
import { SharedService } from '../../../../shared/common-services/shared-service';
import { formatDate } from '../../../../shared/helper/helper-url';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { DateModel } from 'src/app/shared/model/date-model';
import { DateCalculation } from 'src/app/shared/services/date-services/date-calc.service';
import { REQUIRED_VALIDATORS } from 'src/app/shared/constants/input-validators';
import { PublicService } from 'src/app/shared/services/public.service';
import { NotificationsAlertsService } from 'src/app/shared/common-services/notifications-alerts.service';
import { FiscalPeriodServiceProxy } from '../../services/fiscal-period.services';
import { GeneralConfigurationServiceProxy } from '../../services/general-configurations.services';
import { FiscalPeriodStatus } from 'src/app/shared/enum/fiscal-period-status';
import { GeneralConfigurationEnum } from 'src/app/shared/constants/enumrators/enums';


@Component({
  selector: 'app-close-fiscal-period',
  templateUrl: './close-fiscal-period.component.html',
  styleUrls: ['./close-fiscal-period.component.scss']
})
export class CloseFiscalPeriodComponent implements OnInit {
  //#region Main Declarations
  closeFiscalPeriodForm!: FormGroup;
  response: any;
  closeDate: any;
  fromDate: any;
  toDate: any;
  status: string = '';

  closeAccountId: any;
  lang = localStorage.getItem("language")
  companyId = localStorage.getItem("companyId")
  branchId = localStorage.getItem("branchId")
  showDetails: boolean = false
  addUrl: string = '';
  updateUrl: string = '';
  listUrl: string = '/accounting-operations/closeFiscalPeriod';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.close-fiscal-period"),
    componentAdd: '',

  };
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  fiscalPeriodId: number;
  fiscalPeriodList: any;
  routeApi = 'Account/get-ddl?'
  routeApiPeriod = 'FiscalPeriod/get-ddl?'


  constructor(
    private publicService: PublicService,
    private router: Router,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,
    private dateService: DateCalculation,
    private alertsService: NotificationsAlertsService,
    private fiscalPeriodService: FiscalPeriodServiceProxy,
    private generalConfigurationService: GeneralConfigurationServiceProxy,
  ) {
    this.defineCloseFiscalPeriodForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

    this.spinner.show();
    Promise.all([
      this.getFiscalPeriods(),
      this.getGeneralConfigurationsOfCloseAccount(),
      this.getGeneralConfigurationsOfAccountingPeriod()

    ]).then(a => {
      this.changePath();
      this.listenToClickedButton();


    }).catch(err => {
      this.spinner.hide();
    });
    this.spinner.hide();


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

  //#region Subscriptionss

  //#endregion

  //#region  State Management
  //#endregion

  //#region Basic Data
  ///Geting form dropdown list data
  defineCloseFiscalPeriodForm() {
    this.closeFiscalPeriodForm = this.fb.group({
      closeDate: [this.dateService.getCurrentDate(), Validators.compose([Validators.required])],
      fiscalPeriodId: REQUIRED_VALIDATORS



    });
    this.closeDate = this.dateService.getCurrentDate();

  }
  getFiscalPeriods() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeApiPeriod).subscribe({
        next: (res) => {
          if (res.success) {
            this.fiscalPeriodList = res.response;

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



  //#endregion

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.closeFiscalPeriodForm.controls;
  }
  getCloseDate(selectedDate: DateModel) {
    this.closeDate = selectedDate;
  }
  getFromDate(selectedDate: DateModel) {
    this.closeDate = selectedDate;
  }
  getToDate(selectedDate: DateModel) {
    this.toDate = selectedDate;
  }

  //#endregion
  //#region Tabulator
  subsList: Subscription[] = [];
  currentBtnResult;
  listenToClickedButton() {
    let sub = this.sharedServices.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {
        currentBtn;
        if (currentBtn != null) {
          if (currentBtn.action == ToolbarActions.Close && currentBtn.submitMode) {
            this.onClose();
          }
          else if (currentBtn.action == ToolbarActions.Open && currentBtn.submitMode) {
            this.onOpen();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.sharedServices.changeToolbarPath(this.toolbarPathData);
  }
  confirmClose() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.fiscalPeriodService.closeFiscalPeriod(this.fiscalPeriodId, this.fromDate, this.toDate, this.closeAccountId).subscribe({
        next: (result: any) => {
          this.alertsService.showSuccess(
            this.translate.instant("fiscal-period.close-success"),
            ""
          )
          this.defineCloseFiscalPeriodForm();
          this.getFiscalPeriods();
          this.showDetails = false;
          this.fromDate = '';
          this.toDate = '';
          this.submited = false;
          this.spinner.hide();
          return;

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
  confirmOpen() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.fiscalPeriodService.openFiscalPeriod(this.fiscalPeriodId).subscribe({
        next: (result: any) => {
          this.alertsService.showSuccess(
            this.translate.instant("fiscal-period.open-success"),
            ""
          )
          this.defineCloseFiscalPeriodForm();
          this.getFiscalPeriods();
          this.showDetails = false;
          this.fromDate = '';
          this.toDate = '';
          this.submited = false;
          this.spinner.hide();
          return;

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
  onOpen() {
    if (this.closeFiscalPeriodForm.valid) {
      this.spinner.show();
      this.confirmOpen().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }
    else {
      this.errorMessage = this.translate.instant("validation-messages.invalid-data");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return this.closeFiscalPeriodForm.markAllAsTouched();
    }
  }
  onClose() {
    if (this.closeFiscalPeriodForm.valid) {
      if (this.closeAccountId == null || this.closeAccountId == "") {
        this.errorMessage = this.translate.instant("general.close-account-required");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }

      this.spinner.show();
      this.confirmClose().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }
    else {
      this.errorMessage = this.translate.instant("validation-messages.invalid-data");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return this.closeFiscalPeriodForm.markAllAsTouched();
    }
  }
  getFiscalPeriodById(id: any) {
    if (id != null) {
      return new Promise<void>((resolve, reject) => {
        let sub = this.fiscalPeriodService.getFiscalPeriod(id).subscribe({
          next: (res: any) => {
            resolve();
            this.showDetails = true;
            this.fromDate = formatDate(Date.parse(res.response.fromDate));
            this.toDate = formatDate(Date.parse(res.response.toDate));
            if (res.response.fiscalPeriodStatus == FiscalPeriodStatus.Opened) {
              this.status = this.lang == 'ar' ? 'مفتوحة' : 'Opened';
              this.sharedServices.changeButton({ action: 'Close', submitMode: false } as ToolbarData);
              this.sharedServices.changeToolbarPath(this.toolbarPathData);

            }
            else if (res.response.fiscalPeriodStatus == FiscalPeriodStatus.Closed) {
              this.status = this.lang == 'ar' ? 'مغلقة' : 'Closed';
              this.sharedServices.changeButton({ action: 'Open', submitMode: false } as ToolbarData);
              this.sharedServices.changeToolbarPath(this.toolbarPathData);

            }

            else if (res.response.fiscalPeriodStatus == FiscalPeriodStatus.ClosedForRevision) {
              this.status = this.lang == 'ar' ? 'مغلقة للمراجعة' : 'Closed for revision';
              this.sharedServices.changeButton({ action: 'Open', submitMode: false } as ToolbarData);
              this.sharedServices.changeToolbarPath(this.toolbarPathData);

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
    else {
      this.showDetails = false;
      this.fromDate = '';
      this.toDate = '';
    }

  }
  getGeneralConfigurationsOfCloseAccount() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.getGeneralConfiguration(GeneralConfigurationEnum.ClosingAccount).subscribe({
        next: (res: any) => {
          resolve();
          if (res.response.value > 0) {
            this.closeAccountId = res.response.value;
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
  getGeneralConfigurationsOfAccountingPeriod() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.getGeneralConfiguration(GeneralConfigurationEnum.AccountingPeriod).subscribe({
        next: (res: any) => {
          resolve();
          if (res.response.value > 0) {
            if (this.fiscalPeriodList != null) {
              this.fiscalPeriodList.forEach(element => {
                if (element.id == Number(res.response.value)) {
                  this.fiscalPeriodId = Number(res.response.value);
                  this.getFiscalPeriodById(this.fiscalPeriodId);
                }

              });

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


}

