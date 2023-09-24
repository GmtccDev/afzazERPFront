import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { CODE_REQUIRED_VALIDATORS, PHONE_VALIDATORS, REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { TranslateService } from '@ngx-translate/core';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../../shared/helper/helper-url';
import { PublicService } from '../../../../../shared/services/public.service';
import { WarehousesCustomerDto } from '../../../models/warehouses-customer';
import { WarehousesCustomerServiceProxy } from '../../../Services/warehouses-customer.service';
import { CountryDto } from '../../../../master-codes/models/country';
import { CountryServiceProxy } from '../../../../master-codes/services/country.servies';


@Component({
  selector: 'app-add-edit-warehouses-customers',
  templateUrl: './add-edit-warehouses-customers.component.html',
  styleUrls: ['./add-edit-warehouses-customers.component.scss']
})
export class AddEditWarehousesCustomersComponent implements OnInit {
  //#region Main Declarations
  warehousesCustomerForm!: FormGroup;
  id: any = 0;
  currnetUrl;
  lang:any = localStorage.getItem("language")
  routeAccountApi = 'Account/get-ddl?'
  accountsList: any;
  routeApiCountry = 'Country/get-ddl?'
  countriesList: CountryDto[] = [];
  WarehousesCustomer: WarehousesCustomerDto[] = [];
  addUrl: string = '/warehouses-master-codes/warehousesCustomer/add-warehousesCustomer';
  updateUrl: string = '/warehouses-master-codes/warehousesCustomer/update-warehousesCustomer/';
  listUrl: string = '/warehouses-master-codes/warehousesCustomer';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.warehouses-customer"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;

  constructor(
    private warehousesCustomerService: WarehousesCustomerServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedService: SharedService, private translate: TranslateService,
    private publicService: PublicService,
    private countryService: CountryServiceProxy,



  ) {
    this.defineWarehousesCustomerForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    Promise.all([
      this.getAccounts(),
      this.getCountries()


    ]).then(a => {
      this.getRouteData();
      this.currnetUrl = this.router.url;
      if (this.currnetUrl == this.addUrl) {
        this.getWarehousesCustomerCode();
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
          this.getWarehousesCustomerById(this.id).then(a => {
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
  defineWarehousesCustomerForm() {
    this.warehousesCustomerForm = this.fb.group({
      id: 0,
      code: CODE_REQUIRED_VALIDATORS,
      nameAr: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      nameEn: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      address: REQUIRED_VALIDATORS,
      isActive: true,
      phone: PHONE_VALIDATORS,
      fax: '',
      email: '',
      responsiblePerson: REQUIRED_VALIDATORS,
      accountId: REQUIRED_VALIDATORS,
      countryId: ''
    }

    );


  }

  //#endregion

  //#region CRUD Operations
  getWarehousesCustomerById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.warehousesCustomerService.getWarehousesCustomer(id).subscribe({
        next: (res: any) => {
          resolve();
          this.warehousesCustomerForm.setValue({
            id: res.response?.id,
            code: res.response?.code,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            address: res.response?.address,
            phone: res.response?.phone,
            fax: res.response?.fax,
            email: res.response?.email,
            responsiblePerson: res.response?.responsiblePerson,
            accountId: res.response?.accountId,
            countryId: res.response?.countryId,
            isActive: res.response?.isActive,

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
  getWarehousesCustomerCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.warehousesCustomerService.getLastCode().subscribe({
        next: (res: any) => {
          this.toolbarPathData.componentList = this.translate.instant("component-names.warehouses-customer");
          this.warehousesCustomerForm.patchValue({
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
  getCountries() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.countryService.getDdl().subscribe({
        next: (res) => {

          if (res.success) {
            this.countriesList = res.response;

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
    return this.warehousesCustomerForm.controls;
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
            this.toolbarPathData.componentAdd = this.translate.instant('component-names.add-warehouses-Customer');
            this.defineWarehousesCustomerForm();
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
    var inputDto = new WarehousesCustomerDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.warehousesCustomerForm.value;
      this.warehousesCustomerService.createWarehousesCustomer(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.defineWarehousesCustomerForm();
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
    if (this.warehousesCustomerForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.warehousesCustomerForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    var inputDto = new WarehousesCustomerDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.warehousesCustomerForm.value;
      inputDto.id = this.id;

      let sub = this.warehousesCustomerService.updateWarehousesCustomer(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.defineWarehousesCustomerForm();
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

    if (this.warehousesCustomerForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }
    else {
      return this.warehousesCustomerForm.markAllAsTouched();

    }
  }


}


  //#endregion


