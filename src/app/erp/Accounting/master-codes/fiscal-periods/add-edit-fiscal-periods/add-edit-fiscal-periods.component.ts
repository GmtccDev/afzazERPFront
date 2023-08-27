import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { CODE_REQUIRED_VALIDATORS, REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { CreateFiscalPeriodCommand, EditFiscalPeriodCommand, FiscalPeriodDto } from '../../../models/fiscal-period';
import { FiscalPeriodServiceProxy } from '../../../services/fiscal-period.services';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { TranslateService } from '@ngx-translate/core';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../../shared/helper/helper-url';
import { formatDate } from '../../../../../shared/helper/helper-url';
import { FiscalPeriodStatus } from '../../../../../shared/enum/fiscal-period-status';
@Component({
  selector: 'app-add-edit-fiscal-periods',
  templateUrl: './add-edit-fiscal-periods.component.html',
  styleUrls: ['./add-edit-fiscal-periods.component.scss']
})
export class AddEditFiscalPeriodsComponent implements OnInit {
  //#region Main Declarations
  fiscalPeriodForm!: FormGroup;
  sub: any;
  url: any;
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
  constructor(
    private fiscalPeriodService: FiscalPeriodServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private SharedServices: SharedService, private translate: TranslateService
  ) {
    this.definefiscalPeriodForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();

    this.getRouteData();
    this.currnetUrl = this.router.url;
    if (this.currnetUrl == this.addUrl) {
      this.getfiscalPeriodCode();
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
          this.getfiscalPeriodById(this.id).then(a => {
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
        this.spinner.hide();
        this.SharedServices.changeButton({ action: 'New' } as ToolbarData);
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
      nameAr: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(10)])],
      nameEn: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(10)])],
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      fromDate: REQUIRED_VALIDATORS,
      toDate: REQUIRED_VALIDATORS,
      fiscalPeriodStatus: new FormControl('1')
    }, { validator: this.dateRangeValidator });
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
            fromDate: formatDate(Date.parse(res.response.fromDate)),
            toDate: formatDate(Date.parse(res.response.toDate)),
            fiscalPeriodStatus: res.response?.fiscalPeriodStatus.toString()
          });
          console.log(
            'this.fiscalPeriodForm.value set value',
            this.fiscalPeriodForm.value
          );
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
          console.log('complete');
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
            this.toolbarPathData.componentAdd = 'Add fiscalPeriod';
            this.definefiscalPeriodForm();
            this.SharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update) {
            this.onUpdate();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.SharedServices.changeToolbarPath(this.toolbarPathData);
  }
  confirmSave() {
    var inputDto = new CreateFiscalPeriodCommand()
    return new Promise<void>((resolve, reject) => {
      inputDto.inputDto = this.fiscalPeriodForm.value;
      this.fiscalPeriodService.createFiscalPeriod(inputDto).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.response = { ...result.response };
          this.definefiscalPeriodForm();

          this.submited = false;
          this.spinner.hide();

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
    var inputDto = new EditFiscalPeriodCommand()

    return new Promise<void>((resolve, reject) => {

      inputDto.inputDto = this.fiscalPeriodForm.value;

      inputDto.inputDto.id = this.id;
      let sub = this.fiscalPeriodService.updateFiscalPeriod(inputDto).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.response = { ...result.response };
          this.definefiscalPeriodForm();
          this.submited = false;
          this.spinner.hide();
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

}


  //#endregion


