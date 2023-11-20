import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { CODE_REQUIRED_VALIDATORS, REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { TranslateService } from '@ngx-translate/core';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../../shared/helper/helper-url';
import { PeriodDto } from '../../../models/period';
import { PeriodServiceProxy } from '../../../Services/period.service';
import { DateModel } from '../../../../../shared/model/date-model';
import { DateCalculation } from '../../../../../shared/services/date-services/date-calc.service';
@Component({
  selector: 'app-add-edit-period',
  templateUrl: './add-edit-period.component.html',
  styleUrls: ['./add-edit-period.component.scss']
})
export class AddEditPeriodComponent implements OnInit {
  //#region Main Declarations
  periodForm!: FormGroup;
  companyId: any = localStorage.getItem("companyId");
  branchId: any = localStorage.getItem("branchId");
  id: any = 0;
  currnetUrl;
  fromDate!: DateModel;
  toDate!: DateModel;

  Period: PeriodDto[] = [];
  addUrl: string = '/warehouses-master-codes/period/add-period';
  updateUrl: string = '/warehouses-master-codes/period/update-period/';
  listUrl: string = '/warehouses-master-codes/period';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.period"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  constructor(
    private periodService: PeriodServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedService: SharedService, private translate: TranslateService,
    private dateService: DateCalculation

  ) {
    this.definePeriodForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();

    this.getRouteData();
    this.currnetUrl = this.router.url;
    if (this.currnetUrl == this.addUrl) {
      this.getPeriodCode();
    }
    this.changePath();
    this.listenToClickedButton();
    this.spinner.hide();




  }
  getRouteData() {
    let sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = +params['id'];
        if (this.id > 0) {
          this.getPeriodById(this.id).then(a => {
            this.spinner.hide();

          }).catch(err => {
            this.spinner.hide();

          });


        }
        else {
          this.sharedService.changeButton({ action: 'New' } as ToolbarData);
          this.spinner.hide();
        }
      }
      else {
        this.spinner.hide();
        this.sharedService.changeButton({ action: 'New' } as ToolbarData);
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
  definePeriodForm() {
    this.periodForm = this.fb.group({
      id: 0,
      companyId: this.companyId,
      branchId: this.branchId,
      nameAr: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(10)])],
      nameEn: '',
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      fromDate: REQUIRED_VALIDATORS,
      toDate: REQUIRED_VALIDATORS
    }
      , {
        validator: this.dateRangeValidator
      }
    );
    this.fromDate = this.dateService.getCurrentDate();
    this.toDate = this.dateService.getCurrentDate();

  }

  //#endregion

  //#region CRUD Operations
  getPeriodById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.periodService.getPeriod(id).subscribe({
        next: (res: any) => {
          resolve();
          this.periodForm.setValue({
            id: res.response?.id,
            companyId: res.response?.companyId,
            branchId: res.response?.branchId,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive,
            fromDate: this.dateService.getDateForCalender(res.response.fromDate),
            toDate: this.dateService.getDateForCalender(res.response.toDate),
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
  getPeriodCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.periodService.getLastCode().subscribe({
        next: (res: any) => {
          this.toolbarPathData.componentList = this.translate.instant("component-names.period");
          this.periodForm.patchValue({
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
    return this.periodForm.controls;
  }


  //#endregion
  //#region Tabulator
  subsList: Subscription[] = [];
  currentBtnResult;
  listenToClickedButton() {
    let sub = this.sharedService.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {
        currentBtn;

        if (currentBtn != null) {
          if (currentBtn.action == ToolbarActions.List) {
            this.sharedService.changeToolbarPath({
              listPath: this.listUrl,
            } as ToolbarPath);
            this.router.navigate([this.listUrl]);
          } else if (currentBtn.action == ToolbarActions.Save) {
            this.onSave();
          } else if (currentBtn.action == ToolbarActions.New) {
            this.toolbarPathData.componentAdd = this.translate.instant('component-names.add-period');
            if (this.periodForm.value.code != null) {
              this.getPeriodCode()
            }
            this.definePeriodForm();
            this.sharedService.changeToolbarPath(this.toolbarPathData);
          }else if (currentBtn.action == ToolbarActions.Update && currentBtn.submitMode) {
            this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
           this.getPeriodCode();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.sharedService.changeToolbarPath(this.toolbarPathData);
  }
  confirmSave() {
    var inputDto = new PeriodDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.periodForm.value;
      inputDto.fromDate = this.dateService.getDateForInsert(inputDto.fromDate);
      inputDto.toDate = this.dateService.getDateForInsert(inputDto.toDate);
      this.periodService.createPeriod(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.definePeriodForm();
          this.submited = false;

          navigateUrl(this.listUrl, this.router);
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
    if (this.periodForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.periodForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    var inputDto = new PeriodDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.periodForm.value;
      inputDto.id = this.id;
      inputDto.fromDate = this.dateService.getDateForInsert(inputDto.fromDate);
      inputDto.toDate = this.dateService.getDateForInsert(inputDto.toDate);
      let sub = this.periodService.updatePeriod(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.definePeriodForm();
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

    if (this.periodForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }
    else {
      return this.periodForm.markAllAsTouched();

    }
  }
  getFromDate(selectedDate: DateModel) {
    this.fromDate = selectedDate;
  }
  getToDate(selectedDate: DateModel) {
    this.toDate = selectedDate;
  }
  dateRangeValidator(control: FormGroup): { [key: string]: boolean } | null {
    const startDate = control.get('fromDate').value;
    const endDate = control.get('toDate').value;

    if (startDate && endDate) {
      return startDate <= endDate ? null : { 'dateRange': true };
    }

    return null;
  }

}


  //#endregion


