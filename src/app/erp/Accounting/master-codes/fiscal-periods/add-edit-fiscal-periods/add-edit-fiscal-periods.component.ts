import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { CODE_REQUIRED_VALIDATORS, REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { FiscalPeriodDto } from '../../../models/fiscal-period';
import { FiscalPeriodServiceProxy } from '../../../services/fiscal-period.services';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { TranslateService } from '@ngx-translate/core';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../../shared/helper/helper-url';
import { FiscalPeriodStatus } from '../../../../../shared/enum/fiscal-period-status';
import { DateModel } from 'src/app/shared/model/date-model';
import { DateCalculation } from 'src/app/shared/services/date-services/date-calc.service';
import { NotificationsAlertsService } from 'src/app/shared/common-services/notifications-alerts.service';
@Component({
  selector: 'app-add-edit-fiscal-periods',
  templateUrl: './add-edit-fiscal-periods.component.html',
  styleUrls: ['./add-edit-fiscal-periods.component.scss']
})
export class AddEditFiscalPeriodsComponent implements OnInit {
  //#region Main Declarations
  fiscalPeriodForm!: FormGroup;
  id: any = 0;
  currnetUrl;
  fiscalPeriodStatusList = FiscalPeriodStatus;
  fiscalPeriod: FiscalPeriodDto[] = [];
  addUrl: string = '/accounting-master-codes/fiscalPeriod/add-fiscalPeriod';
  updateUrl: string = '/accounting-master-codes/fiscalPeriod/update-fiscalPeriod/';
  listUrl: string = '/accounting-master-codes/fiscalPeriod';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.fiscalPeriod"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  fromDate!: DateModel;
  toDate!: DateModel;
  fiscalPeriods: any;
  constructor(
    private fiscalPeriodService: FiscalPeriodServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private SharedServices: SharedService, private translate: TranslateService,
    private dateService: DateCalculation,
    private alertsService: NotificationsAlertsService,

  ) {
    this.definefiscalPeriodForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

    this.spinner.show();
    this.getFiscalPeriods()
    this.getRouteData();
    this.currnetUrl = this.router.url;
    if (this.currnetUrl == this.addUrl) {
      this.getfiscalPeriodCode();
    }
    this.changePath();
    this.listenToClickedButton();
    this.spinner.hide();

  }
  getFiscalPeriods() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.fiscalPeriodService.allFiscalPeriodes(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.fiscalPeriod");
          if (res.success) {
            this.fiscalPeriods = res.response.items

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
  getRouteData() {
    
    let sub = this.route.params.subscribe((params) => {
      debugger
      if (params['id'] != null) {
        this.id = +params['id'];
        if (this.id > 0) {
          this.getfiscalPeriodById(this.id).then(a => {
            this.SharedServices.changeButton({ action: 'Update',submitMode:false } as ToolbarData);
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
  definefiscalPeriodForm() {
    this.fiscalPeriodForm = this.fb.group({
      id: 0,
      nameAr: ['', Validators.compose([Validators.required, Validators.minLength(2)])],
      nameEn: ['', Validators.compose([Validators.required, Validators.minLength(2)])],
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      fromDate: REQUIRED_VALIDATORS,
      toDate: REQUIRED_VALIDATORS,
      fiscalPeriodStatus: new FormControl('1')
    }, { validator: this.dateRangeValidator });
    this.fromDate = this.dateService.getCurrentDate();
    this.toDate = this.dateService.getCurrentDate();
  }

  //#endregion

  //#region CRUD Operations
  getfiscalPeriodById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.fiscalPeriodService.getFiscalPeriod(id).subscribe({
        next: (res: any) => {
          resolve();
          this.fiscalPeriodForm.setValue({
            id: res.response?.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive,
            fromDate: this.dateService.getDateForCalender(res.response.fromDate),
            toDate: this.dateService.getDateForCalender(res.response.toDate),
            fiscalPeriodStatus: res.response?.fiscalPeriodStatus.toString()
          });
          this.fromDate = this.dateService.getDateForCalender(res.response.fromDate);
          this.toDate = this.dateService.getDateForCalender(res.response.toDate);

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
  getfiscalPeriodCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.fiscalPeriodService.getLastCode().subscribe({

        next: (res: any) => {
          this.toolbarPathData.componentList = this.translate.instant("component-names.fiscalPeriod");
          this.fiscalPeriodForm.patchValue({
            code: res.response
          });

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

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.fiscalPeriodForm.controls;
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
            this.toolbarPathData.componentAdd = this.translate.instant("fiscal-period.add-fiscal-period");
            if (this.fiscalPeriodForm.value.code != null) {
              this.getfiscalPeriodCode()
            }
            this.definefiscalPeriodForm();
            this.SharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update && currentBtn.submitMode) {
            this.onUpdate();
            // this.SharedServices.changeButton({ action: 'Update' } as ToolbarData);
            // this.listenToClickedButton();
            // this.SharedServices.changeToolbarPath(this.toolbarPathData);
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
            this.getfiscalPeriodCode();
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
  confirmSave() {
    var inputDto = new FiscalPeriodDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.fiscalPeriodForm.value;

      const fromDate = this.dateService.getDateForInsert(inputDto.fromDate);
      const toDate = this.dateService.getDateForInsert(inputDto.toDate);
      let hasIntersectionCheck = this.checkDateOverlap(fromDate, toDate, this.fiscalPeriods);

      if (hasIntersectionCheck) {
        this.errorMessage = this.translate.instant("fiscal-period.Intersection");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        this.spinner.hide()
        return;
      }

      inputDto.fromDate = this.dateService.getDateForInsert(inputDto.fromDate);
      inputDto.toDate = this.dateService.getDateForInsert(inputDto.toDate);
      this.fiscalPeriodService.createFiscalPeriod(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.definefiscalPeriodForm();
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
    if (this.fiscalPeriodForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.fiscalPeriodForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    var inputDto = new FiscalPeriodDto()
    return new Promise<void>((resolve, reject) => {
      debugger
      inputDto = this.fiscalPeriodForm.value;
      inputDto.id = this.id;
      const fromDate = this.dateService.getDateForInsert(inputDto.fromDate);
      const toDate = this.dateService.getDateForInsert(inputDto.toDate);
      this.fiscalPeriods = this.fiscalPeriods.filter(c => c.id !== inputDto.id);
      let hasIntersectionCheck = this.checkDateOverlap(fromDate, toDate, this.fiscalPeriods);

      if (hasIntersectionCheck) {
        this.errorMessage = this.translate.instant("fiscal-period.Intersection");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        this.spinner.hide()
        return;
      }

      inputDto.fromDate = this.dateService.getDateForInsert(inputDto.fromDate);
      inputDto.toDate = this.dateService.getDateForInsert(inputDto.toDate);
      let sub = this.fiscalPeriodService.updateFiscalPeriod(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.definefiscalPeriodForm();
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
    if (this.fiscalPeriodForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }
    else {
      return this.fiscalPeriodForm.markAllAsTouched();

    }
  }

  dateRangeValidator(control: FormGroup): { [key: string]: boolean } | null {
    const startDate = control.get('fromDate').value;
    const endDate = control.get('toDate').value;

    if (startDate && endDate) {
      return startDate <= endDate ? null : { 'dateRange': true };
    }

    return null;
  }
  getFromDate(selectedDate: DateModel) {
    this.fromDate = selectedDate;
  }
  getToDate(selectedDate: DateModel) {
    this.toDate = selectedDate;
  }

}


//#endregion


