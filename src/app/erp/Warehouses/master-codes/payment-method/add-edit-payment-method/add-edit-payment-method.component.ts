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
import { PaymentMethodDto } from '../../../models/payment-method';
import { PaymentMethodServiceProxy } from '../../../Services/payment-method.service';
import { PublicService } from '../../../../../shared/services/public.service';

@Component({
  selector: 'app-add-edit-payment-method',
  templateUrl: './add-edit-payment-method.component.html',
  styleUrls: ['./add-edit-payment-method.component.scss']
})
export class AddEditPaymentMethodComponent implements OnInit {
  //#region Main Declarations
  paymentMethodForm!: FormGroup;
  companyId: any = localStorage.getItem("companyId");
  branchId: any = localStorage.getItem("branchId");
  id: any = 0;
  currnetUrl;
  routeAccountApi = 'Account/GetLeafAccounts?'
  accountsList: any;

  paymentMethod: PaymentMethodDto[] = [];
  addUrl: string = '/warehouses-master-codes/paymentMethod/add-paymentMethod';
  updateUrl: string = '/warehouses-master-codes/paymentMethod/update-paymentMethod/';
  listUrl: string = '/warehouses-master-codes/paymentMethod';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.payment-method"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  showSearchAccountModal = false;

  constructor(
    private paymentMethodService: PaymentMethodServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedService: SharedService, private translate: TranslateService,
    private publicService: PublicService,


  ) {
    this.definePaymentMethodForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    Promise.all([
      this.getAccounts()

    ]).then(a => {
      this.getRouteData();
      this.currnetUrl = this.router.url;
      if (this.currnetUrl == this.addUrl) {
        this.getPaymentMethodCode();
      }
      this.changePath();
      this.listenToClickedButton();
    }).catch((err) => {

      this.spinner.hide();
    })

  }
  getRouteData() {
    let sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = +params['id'];
        if (this.id > 0) {
          this.getPaymentMethodById(this.id).then(a => {
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
  definePaymentMethodForm() {
    this.paymentMethodForm = this.fb.group({
      id: 0,
      companyId: this.companyId,
      branchId: this.branchId,
      nameAr: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      nameEn: '',
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      accountId: REQUIRED_VALIDATORS
    }

    );


  }

  //#endregion

  //#region CRUD Operations
  getPaymentMethodById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.paymentMethodService.getPaymentMethod(id).subscribe({
        next: (res: any) => {
          resolve();
          this.paymentMethodForm.setValue({
            id: res.response?.id,
            companyId: res.response?.companyId,
            branchId: res.response?.branchId,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive,
            accountId: res.response?.accountId

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
  getPaymentMethodCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.paymentMethodService.getLastCode().subscribe({
        next: (res: any) => {
          this.toolbarPathData.componentList = this.translate.instant("component-names.payment-method");
          this.paymentMethodForm.patchValue({
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
  getAccounts() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountApi).subscribe({
        next: (res) => {

          if (res.success) {
            this.accountsList = res.response;

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

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.paymentMethodForm.controls;
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
            this.toolbarPathData.componentAdd = this.translate.instant('component-names.add-payment-method');
            if (this.paymentMethodForm.value.code != null) {
              this.getPaymentMethodCode()
            }
            this.definePaymentMethodForm();
            this.sharedService.changeToolbarPath(this.toolbarPathData);
          }else if (currentBtn.action == ToolbarActions.Update && currentBtn.submitMode) {
            this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
           this.getPaymentMethodCode();
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
    var inputDto = new PaymentMethodDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.paymentMethodForm.value;
      this.paymentMethodService.createPaymentMethod(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.definePaymentMethodForm();
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
    if (this.paymentMethodForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.paymentMethodForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    var inputDto = new PaymentMethodDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.paymentMethodForm.value;
      inputDto.id = this.id;

      let sub = this.paymentMethodService.updatePaymentMethod(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.definePaymentMethodForm();
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
    if (this.paymentMethodForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }
    else {
      return this.paymentMethodForm.markAllAsTouched();

    }
  }
  onSelectAccount(event) {
    this.paymentMethodForm.controls.accountId.setValue(event.id);
    this.showSearchAccountModal = false;
  }

}


  //#endregion


