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
import { WarehousesPaymentMethodDto } from '../../../models/warehouses-payment-method';
import { WarehousesPaymentMethodServiceProxy } from '../../../Services/warehouses-payment-method.service';
import { PublicService } from '../../../../../shared/services/public.service';

@Component({
  selector: 'app-add-edit-warehouses-payment-methods',
  templateUrl: './add-edit-warehouses-payment-methods.component.html',
  styleUrls: ['./add-edit-warehouses-payment-methods.component.scss']
})
export class AddEditWarehousesPaymentMethodsComponent implements OnInit {
  //#region Main Declarations
  warehousesPaymentMethodForm!: FormGroup;
  id: any = 0;
  currnetUrl;
  routeAccountApi = 'Account/get-ddl?'
  accountsList: any;

  WarehousesPaymentMethod: WarehousesPaymentMethodDto[] = [];
  addUrl: string = '/warehouses-master-codes/warehousesPaymentMethod/add-warehousesPaymentMethod';
  updateUrl: string = '/warehouses-master-codes/warehousesPaymentMethod/update-warehousesPaymentMethod/';
  listUrl: string = '/warehouses-master-codes/warehousesPaymentMethod';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.warehouses-payment-method"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  constructor(
    private warehousesPaymentMethodService: WarehousesPaymentMethodServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedService: SharedService, private translate: TranslateService,
    private publicService: PublicService,


  ) {
    this.defineWarehousesPaymentMethodForm();
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
        this.getWarehousesPaymentMethodCode();
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
          this.getWarehousesPaymentMethodById(this.id).then(a => {
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
  defineWarehousesPaymentMethodForm() {
    this.warehousesPaymentMethodForm = this.fb.group({
      id: 0,
      nameAr: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      nameEn: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      accountId: REQUIRED_VALIDATORS
    }

    );


  }

  //#endregion

  //#region CRUD Operations
  getWarehousesPaymentMethodById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.warehousesPaymentMethodService.getWarehousesPaymentMethod(id).subscribe({
        next: (res: any) => {
          resolve();
          this.warehousesPaymentMethodForm.setValue({
            id: res.response?.id,
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
          console.log('complete');
        },
      });
      this.subsList.push(sub);

    });
  }
  getWarehousesPaymentMethodCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.warehousesPaymentMethodService.getLastCode().subscribe({
        next: (res: any) => {
          this.toolbarPathData.componentList = this.translate.instant("component-names.warehouses-payment-method");
          this.warehousesPaymentMethodForm.patchValue({
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
  getAccounts() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountApi).subscribe({
        next: (res) => {

          if (res.success) {
            this.accountsList = res.response.filter(x => x.isLeafAccount == true && x.isActive == true);

          }

          resolve();

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
    return this.warehousesPaymentMethodForm.controls;
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
            this.toolbarPathData.componentAdd = this.translate.instant('component-names.add-warehouses-PaymentMethod');
            this.defineWarehousesPaymentMethodForm();
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
    var inputDto = new WarehousesPaymentMethodDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.warehousesPaymentMethodForm.value;
      this.warehousesPaymentMethodService.createWarehousesPaymentMethod(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.defineWarehousesPaymentMethodForm();
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
    if (this.warehousesPaymentMethodForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.warehousesPaymentMethodForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    var inputDto = new WarehousesPaymentMethodDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.warehousesPaymentMethodForm.value;
      inputDto.id = this.id;

      let sub = this.warehousesPaymentMethodService.updateWarehousesPaymentMethod(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.defineWarehousesPaymentMethodForm();
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

    if (this.warehousesPaymentMethodForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }
    else {
      return this.warehousesPaymentMethodForm.markAllAsTouched();

    }
  }


}


  //#endregion


