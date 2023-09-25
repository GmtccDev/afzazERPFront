import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { ItemCardDto } from '../../../models/item-card';
import { ItemCardServiceProxy } from '../../../Services/item-card.service';
import { ICustomEnum } from '../../../../../shared/interfaces/ICustom-enum';
import { ItemTypeEnum, ItemTypeArEnum, CostCalculateMethodsEnum, CostCalculateMethodsArEnum, convertEnumToArray, LifeTimeTypeEnum, LifeTimeTypeArEnum } from '../../../../../shared/constants/enumrators/enums';
import { environment } from 'src/environments/environment';




@Component({
  selector: 'app-add-edit-item-card',
  templateUrl: './add-edit-item-card.component.html',
  styleUrls: ['./add-edit-item-card.component.scss']
})
export class AddEditItemCardComponent implements OnInit {
  //#region Main Declarations
  itemCardForm!: FormGroup;
  id: any = 0;
  currnetUrl;
  lang = localStorage.getItem("language")
  companyId = localStorage.getItem("companyId")
  branchId = localStorage.getItem("branchId")
  routeAccountApi = 'Account/get-ddl?'
  accountsList: any;
  routeItemGroupApi = 'ItemGroup/get-ddl?'
  itemGroupsList: any;

  routeUnitApi = 'WarehousesUnit/get-ddl?'
  unitsList: any;

  files: any;
  imagePath: string;
  fullPathUpdate: string;
  image: any;
  item: ItemCardDto = new ItemCardDto();
  ItemCard: ItemCardDto[] = [];
  addUrl: string = '/warehouses-master-codes/itemCard/add-itemCard';
  updateUrl: string = '/warehouses-master-codes/itemCard/update-itemCard/';
  listUrl: string = '/warehouses-master-codes/itemCard';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.item-card"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  itemTypeEnum: ICustomEnum[] = [];
  costCalculateMethodsEnum: ICustomEnum[] = [];
  lifeTimeTypeEnum: ICustomEnum[] = [];

  constructor(
    private ItemCardService: ItemCardServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedService: SharedService, private translate: TranslateService,
    private publicService: PublicService,
    private cd: ChangeDetectorRef




  ) {
    this.defineItemCardForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.getItemTypeEnum();
    this.getCostCalculateMethodsEnum();
    this.getLifeTimeTypeEnum();

    this.spinner.show();
    Promise.all([
      this.getItemGroups(),
      this.getUnits(),
      this.getAccounts()


    ]).then(a => {
      this.getRouteData();
      this.currnetUrl = this.router.url;
      if (this.currnetUrl == this.addUrl) {
        this.getItemCardCode();
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
          this.getItemCardById(this.id).then(a => {
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
  defineItemCardForm() {
    this.itemCardForm = this.fb.group({
      id: 0,
      companyId: this.companyId,
      branchId: this.branchId,
      code: CODE_REQUIRED_VALIDATORS,
      barcode: '',
      nameAr: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(250)])],
      nameEn: '',
      itemGroupId: REQUIRED_VALIDATORS,
      itemTypeId: '',
      costCalculateMethodId: '',
      notes: '',
      isActive: true,
      model: '',
      manufacturer: '',
      maxLimit: '',
      minLimit: '',
      reorderLimit: '',
      description: '',
      mainUnitId:'',
      sellingPrice: '',
      consumerPrice: '',
      minSellingPrice: '',
      openingCostPrice: '',
      hasExpiredDate: '',
      lifeTime: '',
      lifeTimeType: '',
      hasSerialNumber: '',
      quantity: '',
      warrantyPeriod: '',
      warrantyType: '',
      itemKind: '',
      salesAccountId: '',
      salesReturnsAccountId: '',
      purchasesAccountId: '',
      purchasesReturnsAccountId: '',
      salesCostAccountId: '',
      inventoryAccountId: '',
     

    }

    );


  }

  //#endregion

  //#region CRUD Operations
  getItemCardById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.ItemCardService.getItemCard(id).subscribe({
        next: (res: any) => {
          resolve();
          this.itemCardForm.setValue({
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
  getItemCardCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.ItemCardService.getLastCode().subscribe({
        next: (res: any) => {
          this.toolbarPathData.componentList = this.translate.instant("component-names.item-card");
          this.itemCardForm.patchValue({
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
  getItemGroups() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeItemGroupApi).subscribe({
        next: (res) => {

          if (res.success) {
            this.itemGroupsList = res.response.filter(x => x.isActive == true);

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
  getUnits() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeUnitApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.unitsList = res.response.filter(x => x.isActive == true);

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
  getItemTypeEnum() {
    if (this.lang == 'en') {
      this.itemTypeEnum = convertEnumToArray(ItemTypeEnum);
    }
    else {
      this.itemTypeEnum = convertEnumToArray(ItemTypeArEnum);

    }
  }
  getCostCalculateMethodsEnum() {
    if (this.lang == 'en') {
      this.costCalculateMethodsEnum = convertEnumToArray(CostCalculateMethodsEnum);
    }
    else {
      this.costCalculateMethodsEnum = convertEnumToArray(CostCalculateMethodsArEnum);

    }
  }
  getLifeTimeTypeEnum() {
    if (this.lang == 'en') {
      this.lifeTimeTypeEnum = convertEnumToArray(LifeTimeTypeEnum);
    }
    else {
      this.lifeTimeTypeEnum = convertEnumToArray(LifeTimeTypeArEnum);

    }
  }
  //#endregion

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.itemCardForm.controls;
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
            this.toolbarPathData.componentAdd = this.translate.instant('component-names.add-item');
            this.defineItemCardForm();
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
    var inputDto = new ItemCardDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.itemCardForm.value;
      this.ItemCardService.createItemCard(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.defineItemCardForm();
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
    if (this.itemCardForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.itemCardForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    var inputDto = new ItemCardDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.itemCardForm.value;
      inputDto.id = this.id;

      let sub = this.ItemCardService.updateItemCard(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.defineItemCardForm();
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

    if (this.itemCardForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }
    else {
      return this.itemCardForm.markAllAsTouched();

    }
  }
  onFileChange(event) {
    let reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      this.files = event.target.files;
      this.upload(this.files);
      reader.onload = () => {
        this.cd.markForCheck();
      };
      this.cd.markForCheck();
    }
  }

  upload(files) {
    if (files != null) {
      if (files.length === 0)
        return;
      const formData = new FormData();
      for (let file of files) {
        formData.append(file.name, file);
      }

      let sub = this.ItemCardService.uploadFile(formData).subscribe((res: any) => {

        this.imagePath = environment.apiUrl + "/wwwroot/Uploads/Item/" + res.response;
        this.image = res.response;
      })
      this.subsList.push(sub);


    }
  }


}


//#endregion


