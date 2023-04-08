import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { CODE_REQUIRED_VALIDATORS, NAME_REQUIRED_VALIDATORS, REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { CreateFiscalPeriodCommand, EditFiscalPeriodCommand, FiscalPeriodDto } from '../../../models/fiscal-period';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
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
  Response: any;
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

    this.currnetUrl = this.router.url;
    this.listenToClickedButton();
    this.changePath();
    if (this.currnetUrl == this.addUrl) {
      this.getfiscalPeriodCode();
    }
    this.sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = +params['id'];
        if (this.id > 0) {
          this.getfiscalPeriodById(this.id);
        }
        this.url = this.router.url.split('/')[2];
      }
    });
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
      nameAr: ['', Validators.compose([ Validators.required,Validators.minLength(2),Validators.maxLength(10)])],
      nameEn: ['', Validators.compose([ Validators.required,Validators.minLength(2),Validators.maxLength(10)])],
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      fromDate: REQUIRED_VALIDATORS,
      toDate: REQUIRED_VALIDATORS,
      fiscalPeriodStatus: new FormControl('1')
    }, {validator: this.dateRangeValidator});
  }

  //#endregion

  //#region CRUD Operations
  getfiscalPeriodById(id: any) {
    const promise = new Promise<void>((resolve, reject) => {
      this.fiscalPeriodService.getFiscalPeriod(id).subscribe({
        next: (res: any) => {
          console.log('result data getbyid', res);
          this.fiscalPeriodForm.setValue({
            id: res.response?.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive,
            fromDate: formatDate(Date.parse(res.response.fromDate)),
            toDate: formatDate(Date.parse(res.response.toDate)),
            fiscalPeriodStatus:res.response?.fiscalPeriodStatus.toString() 
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
    });
    return promise;
  }
  getfiscalPeriodCode() {
    const promise = new Promise<void>((resolve, reject) => {
      this.fiscalPeriodService.getLastCode().subscribe({

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
  onSave() {
    var inputDto = new CreateFiscalPeriodCommand()
    if (this.fiscalPeriodForm.valid) {
      const promise = new Promise<void>((resolve, reject) => {
        inputDto.inputDto = this.fiscalPeriodForm.value;
        this.fiscalPeriodService.createFiscalPeriod(inputDto).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result dataaddData ', result);
            this.Response = { ...result.response };
            this.definefiscalPeriodForm();

            this.submited = false;
            setTimeout(() => {
              this.spinner.hide();

              navigateUrl(this.listUrl, this.router);
            }, 1000);
          },
          error: (err: any) => {
            reject(err);
          },
          complete: () => {
            console.log('complete');
          },
        });
      });
      return promise;

    } else {

      //  return this.fiscalPeriodForm.markAllAsTouched();
    }
  }


  onUpdate() {

    if (this.fiscalPeriodForm.valid) {
      var inputDto = new EditFiscalPeriodCommand()
      // this.currencyForm.value.id = this.id;
      console.log("this.VendorCommissionsForm.value", this.fiscalPeriodForm.value)
      const promise = new Promise<void>((resolve, reject) => {

        inputDto.inputDto = this.fiscalPeriodForm.value;

        inputDto.inputDto.id = this.id;
        console.log("this.VendorCommissionsForm.value", this.fiscalPeriodForm.value)
        const promise = new Promise<void>((resolve, reject) => {
          this.fiscalPeriodService.updateFiscalPeriod(inputDto).subscribe({
            next: (result: any) => {
              this.spinner.show();
              console.log('result update ', result);
              this.Response = { ...result.response };
              this.definefiscalPeriodForm();
              this.submited = false;
              setTimeout(() => {
                this.spinner.hide();

                navigateUrl(this.listUrl, this.router);
              }, 1000);
            },
            error: (err: any) => {
              reject(err);
            },
            complete: () => {
              console.log('complete');
            },
          });
        });
        return promise;
      })
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


