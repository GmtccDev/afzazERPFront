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
import { SupplierCardDto } from '../../../models/supplier-card';
import { SupplierCardServiceProxy } from '../../../Services/supplier-card.service';
import { CountryDto } from '../../../../master-codes/models/country';
import { CountryServiceProxy } from '../../../../master-codes/services/country.servies';


@Component({
  selector: 'app-add-edit-supplier-card',
  templateUrl: './add-edit-supplier-card.component.html',
  styleUrls: ['./add-edit-supplier-card.component.scss']
})
export class AddEditSupplierCardComponent implements OnInit {
  //#region Main Declarations
  supplierCardForm!: FormGroup;
  companyId: any = localStorage.getItem("companyId");
  branchId: any = localStorage.getItem("branchId");
  id: any = 0;
  currnetUrl;
  lang: any = localStorage.getItem("language")
  routeAccountApi = 'Account/get-ddl?'
  accountsList: any;
  routeApiCountry = 'Country/get-ddl?'
  countriesList: CountryDto[] = [];
  SupplierCard: SupplierCardDto[] = [];
  addUrl: string = '/warehouses-master-codes/supplierCard/add-supplierCard';
  updateUrl: string = '/warehouses-master-codes/supplierCard/update-supplierCard/';
  listUrl: string = '/warehouses-master-codes/supplierCard';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.supplier-card"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;

  constructor(
    private supplierCardService: SupplierCardServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedService: SharedService, private translate: TranslateService,
    private publicService: PublicService,
    private countryService: CountryServiceProxy,



  ) {
    this.defineSupplierCardForm();
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
        this.getSupplierCardCode();
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
          this.getSupplierCardById(this.id).then(a => {
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
  defineSupplierCardForm() {
    this.supplierCardForm = this.fb.group({
      id: 0,
      code: CODE_REQUIRED_VALIDATORS,
      companyId: this.companyId,
      branchId: this.branchId,
      nameAr: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      nameEn: '',
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
  getSupplierCardById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.supplierCardService.getSupplierCard(id).subscribe({
        next: (res: any) => {
          resolve();
          this.supplierCardForm.setValue({
            id: res.response?.id,
            code: res.response?.code,
            companyId: res.response?.companyId,
            branchId: res.response?.branchId,
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
  getSupplierCardCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.supplierCardService.getLastCode().subscribe({
        next: (res: any) => {
          this.toolbarPathData.componentList = this.translate.instant("component-names.supplier-card");
          this.supplierCardForm.patchValue({
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
    return this.supplierCardForm.controls;
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
            this.toolbarPathData.componentAdd = this.translate.instant('component-names.add-supplier-card');
            this.defineSupplierCardForm();
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
    var inputDto = new SupplierCardDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.supplierCardForm.value;
      let sub = this.supplierCardService.createSupplierCard(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.defineSupplierCardForm();
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
  onSave() {
    if (this.supplierCardForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.supplierCardForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    var inputDto = new SupplierCardDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.supplierCardForm.value;
      inputDto.id = this.id;

      let sub = this.supplierCardService.updateSupplierCard(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.defineSupplierCardForm();
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

    if (this.supplierCardForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }
    else {
      return this.supplierCardForm.markAllAsTouched();

    }
  }


}


//#endregion


