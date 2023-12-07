import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { TranslateService } from '@ngx-translate/core';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../../shared/helper/helper-url';
import { AccountingPeriodServiceProxy } from '../../../services/accounting-period.service';
import { DateCalculation, DateModel } from '../../../../../shared/services/date-services/date-calc.service';
import { NotificationsAlertsService } from '../../../../../shared/common-services/notifications-alerts.service';
import { AccountingPeriodDto } from '../../../models/accounting-period';
import { GeneralConfigurationEnum } from 'src/app/shared/constants/enumrators/enums';
import { GeneralConfigurationServiceProxy } from '../../../services/general-configurations.services';
import { FiscalPeriodServiceProxy } from '../../../services/fiscal-period.services';
import { FiscalPeriodStatus } from 'src/app/shared/enum/fiscal-period-status';
import { DateConverterService } from 'src/app/shared/services/date-services/date-converter.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-add-closed-accounting-period',
  templateUrl: './add-closed-accounting-period.component.html',
  styleUrls: ['./add-closed-accounting-period.component.scss']
})
export class AddClosedAccountingPeriodComponent implements OnInit {
  //#region Main Declarations
  lang = localStorage.getItem("language")
  companyId = localStorage.getItem("companyId")
  accountingPeriodForm!: FormGroup;
  accountingPeriods: any;
  id: any = 0;
  currnetUrl;
  fiscalPeriodFromDate: any;
  fiscalPeriodToDate: any;
  addUrl: string = '/accounting-operations/closedAccountingPeriod/add-closedAccountingPeriod';
  updateUrl: string = '/accounting-opertaions/closedAccountingPeriod/update-closedAccountingPeriod/';
  listUrl: string = '/accounting-operations/closedAccountingPeriod';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.close-accounting-period"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  fromDate!: DateModel;
  toDate!: DateModel;
  fiscalPeriodId: number;
  fiscalPeriodName: string;
  fiscalPeriodStatus: number;
  constructor(
    private accountingPeriodService: AccountingPeriodServiceProxy,
    private generalConfigurationService: GeneralConfigurationServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private SharedServices: SharedService, private translate: TranslateService,
    private dateService: DateCalculation,
    private alertsService: NotificationsAlertsService,
    private fiscalPeriodService: FiscalPeriodServiceProxy,
    private dateConverterService: DateConverterService,
    private datePipe: DatePipe,



  ) {
    this.defineAccountingPeriodForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();

    Promise.all([
      this.getGeneralConfigurationsOfFiscalPeriod(), this.getAccountingPeriods()

    ]).then(a => {
      this.getRouteData();
      this.currnetUrl = this.router.url;
      this.changePath();
      this.listenToClickedButton();
      this.spinner.hide();

    }).catch(err => {
      this.spinner.hide();
    });


  }

  getRouteData() {
    let sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = +params['id'];
        if (this.id > 0) {
          this.getAccountingPeriodById(this.id).then(a => {
            this.SharedServices.changeButton({ action: 'Update', submitMode: false } as ToolbarData);
            this.spinner.hide();

          }).catch(err => {
            this.spinner.hide();

          });


        }
        else {
          this.SharedServices.changeButton({ action: 'New' } as ToolbarData);
          this.spinner.hide();
        }
      }
      else {
        this.SharedServices.changeButton({ action: 'New' } as ToolbarData);
        this.spinner.hide();

      }
    });
    this.subsList.push(sub);

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
  defineAccountingPeriodForm() {
    this.accountingPeriodForm = this.fb.group({
      id: 0,
      companyId: this.companyId,
      fiscalPeriodId: this.fiscalPeriodId,
      fromDate: REQUIRED_VALIDATORS,
      toDate: REQUIRED_VALIDATORS,


    }, { validator: this.dateRangeValidator });
    this.fromDate = this.dateService.getCurrentDate();
    this.toDate = this.dateService.getCurrentDate();
  }

  //#endregion

  //#region CRUD Operations


  //#endregion

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.accountingPeriodForm.controls;
  }
  getGeneralConfigurationsOfFiscalPeriod() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.getGeneralConfiguration(GeneralConfigurationEnum.AccountingPeriod).subscribe({
        next: (res: any) => {
          resolve();
          if (res.response.value > 0) {
            this.fiscalPeriodId = res.response.value;
            this.getfiscalPeriodById(this.fiscalPeriodId);


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
          this.fiscalPeriodName = this.lang == 'ar' ? res.response?.nameAr : res.response?.nameEn;
          this.fiscalPeriodStatus = res.response?.fiscalPeriodStatus.toString();
            
          this.fiscalPeriodFromDate = res.response?.fromDate;
          this.fiscalPeriodToDate = res.response?.toDate;


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
  getAccountingPeriodById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.accountingPeriodService.getAccountingPeriod(id).subscribe({
        next: (res: any) => {
          resolve();
          this.accountingPeriodForm.setValue({
            id: res.response?.id,
            companyId: res.response?.companyId,
            fiscalPeriodId: res.response?.fiscalPeriodId,
            fromDate: this.dateService.getDateForCalender(res.response?.fromDate),
            toDate: this.dateService.getDateForCalender(res.response?.toDate),


          });
          this.fromDate = this.dateService.getDateForCalender(res.response?.fromDate);
          this.toDate = this.dateService.getDateForCalender(res.response?.toDate);


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
  //#region Tabulator
  subsList: Subscription[] = [];
  currentBtnResult;
  listenToClickedButton() {
    let sub = this.SharedServices.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {
        currentBtn;

        if (currentBtn != null) {
          if (currentBtn.action == ToolbarActions.List) {
            this.SharedServices.changeToolbarPath({
              listPath: this.listUrl,
            } as ToolbarPath);
            this.router.navigate([this.listUrl]);
          } else if (currentBtn.action == ToolbarActions.Save) {
            this.onSave();
          } else if (currentBtn.action == ToolbarActions.New) {
            this.toolbarPathData.componentAdd = this.translate.instant("component-names.close-accounting-period");
            this.defineAccountingPeriodForm();
            this.SharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update && currentBtn.submitMode) {
            this.onUpdate();

          }
          else if (currentBtn.action == ToolbarActions.Copy) {
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.SharedServices.changeToolbarPath(this.toolbarPathData);
  }
  checkDateOverlap(startDate, endDate, list: any[]): boolean {

    for (const item of list) {
      const itemStartDate = this.dateService.getDateForInsertCheck(item.fromDate);
      const itemEndDate = this.dateService.getDateForInsertCheck(item.toDate);
      if (this.dateService.splitDate(startDate) <= this.dateService.splitDate(itemEndDate) && this.dateService.splitDate(endDate) >= this.dateService.splitDate(itemStartDate)) {
        return true; // Overlapping dates found
      }
    }

    return false; // No overlapping dates found
  }
  dateRangeValidator(control: FormGroup): { [key: string]: boolean } | null {
    const startDate = control.get('fromDate').value;
    const endDate = control.get('toDate').value;

    if (startDate && endDate) {
      return startDate <= endDate ? null : { 'dateRange': true };
    }

    return null;
  }
  confirmSave() {
    var inputDto = new AccountingPeriodDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.accountingPeriodForm.value;

      const fromDate = this.dateService.getDateForInsert(inputDto.fromDate);
      const toDate = this.dateService.getDateForInsert(inputDto.toDate);
      if (this.dateService.splitDate(toDate) < this.dateService.splitDate(fromDate)) {
        //dateGreater
        this.errorMessage = this.translate.instant("dateGreater");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        this.spinner.hide();
        return;
      }
      let hasIntersectionCheck = this.checkDateOverlap(fromDate, toDate, this.accountingPeriods);

      if (hasIntersectionCheck) {
        this.errorMessage = this.translate.instant("closed-accounting-period.Intersection");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        this.spinner.hide()
        return;
      }

      inputDto.fromDate = this.dateService.getDateForInsert(inputDto.fromDate);
      inputDto.toDate = this.dateService.getDateForInsert(inputDto.toDate);
      this.accountingPeriodService.createAccountingPeriod(inputDto).subscribe({
        next: (result: any) => {
          this.defineAccountingPeriodForm();
          this.submited = false;
          navigateUrl(this.listUrl, this.router);
          this.spinner.hide()

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
        },
      });
    });
  }
  onSave() {
    if (this.accountingPeriodForm.valid) {
      if (this.fiscalPeriodId == 0 || this.fiscalPeriodId == null || (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened)) {
        this.errorMessage = this.translate.instant("closed-accounting-period.choose-opened-fiscal-year");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;

      }
        
      let fromDate = this.accountingPeriodForm.controls["fromDate"].value;
      let accountingPeriodFromDate = this.dateConverterService.getDateTimeForInsertISO_Format(fromDate);

      // let checkFromDate = this.dateService.getDateForInsert(this.fromDate)
      // const fromDate = new Date(checkFromDate);
      // const accountingPeriodFromDate = this.datePipe.transform(fromDate, 'yyyy-MM-ddT00:00:00');


      let toDate = this.accountingPeriodForm.controls["toDate"].value;
      let accountingPeriodToDate = this.dateConverterService.getDateTimeForInsertISO_Format(toDate);

      // let checkToDate = this.dateService.getDateForInsert(this.toDate)
      // const toDate = new Date(checkToDate);
      // const accountingPeriodToDate = this.datePipe.transform(toDate, 'yyyy-MM-ddT00:00:00');


      if (!(accountingPeriodFromDate >= this.fiscalPeriodFromDate && accountingPeriodFromDate <= this.fiscalPeriodToDate
        &&
        accountingPeriodToDate >= this.fiscalPeriodFromDate && accountingPeriodToDate <= this.fiscalPeriodToDate)
      ) {
        this.errorMessage = this.translate.instant("closed-accounting-period.date-range-out");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;

      }
     
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.accountingPeriodForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    var inputDto = new AccountingPeriodDto()
    return new Promise<void>((resolve, reject) => {

      inputDto = this.accountingPeriodForm.value;
      inputDto.id = this.id;
      const fromDate = this.dateService.getDateForInsert(inputDto.fromDate);
      const toDate = this.dateService.getDateForInsert(inputDto.toDate);
      if (this.dateService.splitDate(toDate) < this.dateService.splitDate(fromDate)) {
        //dateGreater
        this.errorMessage = this.translate.instant("dateGreater");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        this.spinner.hide();
        return;
      }
      this.accountingPeriods = this.accountingPeriods.filter(c => c.id !== inputDto.id);
      let hasIntersectionCheck = this.checkDateOverlap(fromDate, toDate, this.accountingPeriods);

      if (hasIntersectionCheck) {
        this.errorMessage = this.translate.instant("closed-accounting-period.Intersection");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        this.spinner.hide()
        return;
      }

      inputDto.fromDate = this.dateService.getDateForInsert(inputDto.fromDate);
      inputDto.toDate = this.dateService.getDateForInsert(inputDto.toDate);
      let sub = this.accountingPeriodService.updateAccountingPeriod(inputDto).subscribe({
        next: (result: any) => {
          this.defineAccountingPeriodForm();
          this.submited = false;
          navigateUrl(this.listUrl, this.router);
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

  onUpdate() {
    if (this.accountingPeriodForm.valid) {
      if (this.fiscalPeriodId == 0 || this.fiscalPeriodId == null || (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened)) {
        this.errorMessage = this.translate.instant("closed-accounting-period.choose-opened-fiscal-year");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;

      }
        
      let fromDate = this.accountingPeriodForm.controls["fromDate"].value;
      let accountingPeriodFromDate = this.dateConverterService.getDateTimeForInsertISO_Format(fromDate);


      let toDate = this.accountingPeriodForm.controls["toDate"].value;
      let accountingPeriodToDate = this.dateConverterService.getDateTimeForInsertISO_Format(toDate);


      if (!(accountingPeriodFromDate >= this.fiscalPeriodFromDate && accountingPeriodFromDate <= this.fiscalPeriodToDate
        &&
        accountingPeriodToDate >= this.fiscalPeriodFromDate && accountingPeriodToDate <= this.fiscalPeriodToDate)
      ) {
        this.errorMessage = this.translate.instant("closed-accounting-period.date-range-out");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;

      }
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }
    else {
      return this.accountingPeriodForm.markAllAsTouched();

    }
  }
  getAccountingPeriods() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.accountingPeriodService.allAccountingPeriods(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {

          //this.toolbarPathData.componentList = this.translate.instant("component-names.fiscalPeriod");
          if (res.success) {
            this.accountingPeriods = res.response.items.filter(x => x.companyId == this.companyId && x.fiscalPeriodId == this.fiscalPeriodId);

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

  getFromDate(selectedDate: DateModel) {
    this.fromDate = selectedDate;
  }
  getToDate(selectedDate: DateModel) {
    this.toDate = selectedDate;
  }

}


//#endregion


