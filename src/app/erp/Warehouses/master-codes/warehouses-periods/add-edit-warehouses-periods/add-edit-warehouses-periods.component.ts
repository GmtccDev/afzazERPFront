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
import { WarehousesPeriodDto } from '../../../models/warehouses-period';
import { WarehousesPeriodServiceProxy } from '../../../Services/warehousesperiod.service';
import { DateModel } from 'src/app/shared/model/date-model';
import { DateCalculation } from 'src/app/shared/services/date-services/date-calc.service';
@Component({
  selector: 'app-add-edit-warehouses-periods',
  templateUrl: './add-edit-warehouses-periods.component.html',
  styleUrls: ['./add-edit-warehouses-periods.component.scss']
})
export class AddEditWarehousesPeriodsComponent implements OnInit {
  //#region Main Declarations
  warehousesPeriodForm!: FormGroup;
  id: any = 0;
  currnetUrl;
  fromDate!: DateModel;
  toDate!: DateModel;

  WarehousesPeriod: WarehousesPeriodDto[] = [];
  addUrl: string = '/warehouses-master-codes/warehousesPeriod/add-warehousesPeriod';
  updateUrl: string = '/warehouses-master-codes/warehousesPeriod/update-warehousesPeriod/';
  listUrl: string = '/warehouses-master-codes/warehousesPeriod';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.warehouses-period"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  constructor(
    private warehousesPeriodService: WarehousesPeriodServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedService: SharedService, private translate: TranslateService,
    private dateService: DateCalculation

  ) {
    this.defineWarehousesPeriodForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();

    this.getRouteData();
    this.currnetUrl = this.router.url;
    if (this.currnetUrl == this.addUrl) {
      this.getWarehousesPeriodCode();
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
          this.getWarehousesPeriodById(this.id).then(a => {
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
  defineWarehousesPeriodForm() {
    this.warehousesPeriodForm = this.fb.group({
      id: 0,
      nameAr: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(10)])],
      nameEn: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(10)])],
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
  getWarehousesPeriodById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.warehousesPeriodService.getWarehousesPeriod(id).subscribe({
        next: (res: any) => {
          resolve();
          this.warehousesPeriodForm.setValue({
            id: res.response?.id,
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
          console.log('complete');
        },
      });
      this.subsList.push(sub);

    });
  }
  getWarehousesPeriodCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.warehousesPeriodService.getLastCode().subscribe({
        next: (res: any) => {
          this.toolbarPathData.componentList = this.translate.instant("component-names.warehouses-period");
          this.warehousesPeriodForm.patchValue({
            code: res.response
          });

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

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.warehousesPeriodForm.controls;
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
            this.toolbarPathData.componentAdd = this.translate.instant('component-names.add-warehouses-period');
            this.defineWarehousesPeriodForm();
            this.sharedService.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update) {
            this.onUpdate();
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
    var inputDto = new WarehousesPeriodDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.warehousesPeriodForm.value;
      inputDto.fromDate = this.dateService.getDateForInsert(inputDto.fromDate);
      inputDto.toDate = this.dateService.getDateForInsert(inputDto.toDate);
      this.warehousesPeriodService.createWarehousesPeriod(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.defineWarehousesPeriodForm();
          this.submited = false;

          navigateUrl(this.listUrl, this.router);
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });
    });
  }
  onSave() {
    if (this.warehousesPeriodForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.warehousesPeriodForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    var inputDto = new WarehousesPeriodDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.warehousesPeriodForm.value;
      inputDto.id = this.id;
      inputDto.fromDate = this.dateService.getDateForInsert(inputDto.fromDate);
      inputDto.toDate = this.dateService.getDateForInsert(inputDto.toDate);
      let sub = this.warehousesPeriodService.updateWarehousesPeriod(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.defineWarehousesPeriodForm();
          this.submited = false;
          navigateUrl(this.listUrl, this.router);
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

  onUpdate() {

    if (this.warehousesPeriodForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }
    else {
      return this.warehousesPeriodForm.markAllAsTouched();

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


