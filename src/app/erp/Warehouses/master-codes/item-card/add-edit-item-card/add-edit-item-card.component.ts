import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { PublicService } from '../../../../../shared/services/public.service';
import { ItemCardAlternativeDto, ItemCardDto, ItemCardUnitDto } from '../../../models/item-card';
import { ItemCardServiceProxy } from '../../../Services/item-card.service';
import { ICustomEnum } from '../../../../../shared/interfaces/ICustom-enum';
import { ItemTypeEnum, ItemTypeArEnum, CostCalculateMethodsEnum, CostCalculateMethodsArEnum, convertEnumToArray, LifeTimeTypeEnum, LifeTimeTypeArEnum, WarrantyTypeEnum, WarrantyTypeArEnum, AccountClassificationsEnum } from '../../../../../shared/constants/enumrators/enums';
import { environment } from 'src/environments/environment';
import { UnitServiceProxy } from '../../../Services/unit.servies';
import { UnitDto, UnitTransactionDto } from '../../../models/unit';

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
  salesAccountsList: any;
  salesReturnsAccountsList: any;
  purchasesAccountsList: any;
  purchasesReturnsAccountsList: any;
  salesCostAccountsList: any;
  inventoryAccountsList: any;
  unitTransactionsList: any;
  filterUnitTransactionsList: any;


  routeItemGroupApi = 'ItemGroupsCard/get-ddl?'
  itemGroupsList: any;

  routeUnitApi = 'Unit/get-ddl?'
  mainUnitsList: any;
  unitsList: any;

  routeItemCardApi = 'ItemCard/get-ddl?'
  itemsList: any;

  files: any;
  imagePath: string;
  fullPathUpdate: string;
  image: any;
  itemCard: ItemCardDto = new ItemCardDto();
  itemCardUnit: ItemCardUnitDto[] = [];
  itemCardAlternative: ItemCardAlternativeDto[] = [];
  selectedItemCardAlternative: ItemCardAlternativeDto = new ItemCardAlternativeDto();

  unit: UnitTransactionDto[] = [];
  selectedUnit: UnitTransactionDto = new UnitTransactionDto();


  //ItemCard: ItemCardDto[] = [];
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
  warrantyTypeEnum: ICustomEnum[] = [];
  itemKindList: { nameAr: string; nameEn: string; value: string; }[];
  itemAlternativeTypeList: { nameAr: string; nameEn: string; value: string; }[];
  warehousesTaxesDetail: any;
  warehousesTaxesMaster: any;

  constructor(
    private itemCardService: ItemCardServiceProxy,
    private unitService: UnitServiceProxy,
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
    this.getWarrantyTypeEnum();
    this.getItemKind();
    this.getItemAlternativeType();

    this.spinner.show();
    Promise.all([
      this.getItemGroups(),
      this.getMainUnits(),
      this.getUnitTransactions(),
      this.getAccounts(),
      //this.getItems()


    ]).then(a => {
      this.getRouteData();
      this.currnetUrl = this.router.url;
      if (this.currnetUrl == this.addUrl) {
        //this.getItemCardCode();
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
      itemType: '',
      image: '',
      costCalculateMethod: '',
      notes: '',
      model: '',
      manufacturer: '',
      maxLimit: '',
      minLimit: '',
      reorderLimit: '',
      description: '',
      mainUnitId: '',
      sellingPrice: '',
      consumerPrice: '',
      minSellingPrice: '',
      openingCostPrice: '',
      hasExpiredDate: false,
      lifeTime: '',
      lifeTimeType: '',
      hasSerialNumber: false,
      quantity: '',
      warrantyPeriod: '',
      warrantyType: '',
      itemKind: '',
      heightFactor: '',
      widthFactor: '',
      lengthFactor: '',
      salesAccountId: '',
      salesReturnsAccountId: '',
      purchasesAccountId: '',
      purchasesReturnsAccountId: '',
      salesCostAccountId: '',
      inventoryAccountId: '',
      isActive: true



    }

    );


  }

  //#endregion

  //#region CRUD Operations
  getItemCardById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.itemCardService.getItemCard(id).subscribe({
        next: (res: any) => {
          resolve();
          this.itemCardForm.setValue({
            id: res.response.id,
            companyId: res.response.companyId,
            branchId: res.response.branchId,
            code: res.response.code,
            barcode: res.response?.barcode,
            nameAr:res.response.nameAr ,
            nameEn: res.response?.nameEn,
            itemGroupId: res.response.itemGroupId,
            itemType: res.response,
            image: res.response?.itemType,
            costCalculateMethod: res.response?.costCalculateMethod,
            notes: res.response?.notes,
            model: res.response?.model,
            manufacturer: res.response?.manufacturer,
            maxLimit: res.response?.maxLimit,
            minLimit: res.response?.minLimit,
            reorderLimit: res.response?.reorderLimit,
            description: res.response?.description,
            mainUnitId: res.response?.mainUnitId,
            sellingPrice: res.response?.sellingPrice,
            consumerPrice: res.response?.consumerPrice,
            minSellingPrice: res.response?.minSellingPrice,
            openingCostPrice: res.response?.openingCostPrice,
            hasExpiredDate: res.response?.hasExpiredDate,
            lifeTime: res.response?.lifeTime,
            lifeTimeType: res.response?.lifeTimeType,
            hasSerialNumber: res.response?.hasSerialNumber,
            quantity: res.response?.quantity,
            warrantyPeriod: res.response?.warrantyPeriod,
            warrantyType: res.response?.warrantyType,
            itemKind: res.response?.itemKind,
            heightFactor: res.response?.heightFactor,
            widthFactor: res.response?.widthFactor,
            lengthFactor: res.response?.lengthFactor,
            salesAccountId: res.response?.salesAccountId,
            salesReturnsAccountId: res.response?.salesReturnsAccountId,
            purchasesAccountId: res.response?.purchasesAccountId,
            purchasesReturnsAccountId: res.response?.purchasesReturnsAccountId,
            salesCostAccountId: res.response?.salesCostAccountId,
            inventoryAccountId: res.response?.inventoryAccountId,
            isActive: res.response?.isActive


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
      let sub = this.itemCardService.getLastCode().subscribe({
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
            this.salesAccountsList = res.response.filter(x => x.isLeafAccount == true && x.accountClassificationId == AccountClassificationsEnum.Sales && x.isActive == true);
            this.salesReturnsAccountsList = res.response.filter(x => x.isLeafAccount == true && x.accountClassificationId == AccountClassificationsEnum.Sales && x.isActive == true);
            this.purchasesAccountsList = res.response.filter(x => x.isLeafAccount == true && x.accountClassificationId == AccountClassificationsEnum.Purchases && x.isActive == true);
            this.purchasesReturnsAccountsList = res.response.filter(x => x.isLeafAccount == true && x.accountClassificationId == AccountClassificationsEnum.Purchases && x.isActive == true);
            this.salesCostAccountsList = res.response.filter(x => x.isLeafAccount == true && x.accountClassificationId == AccountClassificationsEnum.Sales && x.isActive == true);
            this.inventoryAccountsList = res.response.filter(x => x.isLeafAccount == true && x.accountClassificationId == AccountClassificationsEnum.Inventory && x.isActive == true);

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
  getMainUnits() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeUnitApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.mainUnitsList = res.response.filter(x => x.isActive == true);


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
  getItems() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeItemCardApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.itemsList = res.response.filter(x => x.isActive == true);

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
  getWarrantyTypeEnum() {
    if (this.lang == 'en') {
      this.warrantyTypeEnum = convertEnumToArray(WarrantyTypeEnum);
    }
    else {
      this.warrantyTypeEnum = convertEnumToArray(WarrantyTypeArEnum);

    }
  }
  getItemKind() {
    this.itemKindList = [
      { nameAr: 'مادة مساحة', nameEn: 'Space Material', value: '1' },
      { nameAr: 'مادة حجم', nameEn: 'Size Material', value: '2' }
    ];
  }
  getItemAlternativeType() {
    this.itemAlternativeTypeList = [
      { nameAr: 'بديل من طرف واحد', nameEn: 'Unilateral Alternative', value: '1' },
      { nameAr: 'بديل من طرفين', nameEn: 'Two-party Alternative', value: '2' }
    ];
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
            if (this.itemCardForm.value.code != null) {
              this.getItemCardCode()
            }
            this.defineItemCardForm();
            this.sharedService.changeToolbarPath(this.toolbarPathData);
          }else if (currentBtn.action == ToolbarActions.Update) {
            this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
           this.getItemCardCode();
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
      this.itemCardService.createItemCard(inputDto).subscribe({
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

      let sub = this.itemCardService.updateItemCard(inputDto).subscribe({
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

      let sub = this.itemCardService.uploadFile(formData).subscribe((res: any) => {
        this.imagePath = environment.apiUrl + "/wwwroot/Uploads/Item/" + res.response;
        this.itemCardForm.value.image = this.imagePath;
        this.image = res.response;
      })
      this.subsList.push(sub);


    }
  }
  getUnitTransactions() {
    return new Promise<void>((resolve, reject) => {
      
      let sub = this.unitService.getUnitTransactions().subscribe({
        next: (res) => {

          if (res.success) {
            
            this.unitTransactionsList = res.response;

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
  getUnitsByMainUnitId(mainUnitId: any) {
    
    this.unitsList=this.unitTransactionsList.filter(x=>x.unitMasterId==mainUnitId);
    // this.itemCardUnit = [];
    // this.filterUnitTransactionsList = this.unitTransactionsList.filter(x => x.MasterId == mainUnitId);
    // this.filterUnitTransactionsList.forEach(element => {
    //   //  let unitName=this.unitsList.filter(x=>x.id==element.DetailId);
    //   this.itemCardUnit.push(
    //     {
    //       unitId: element.warehousesUnitDetailId,
    //       unitName: element.warehousesUnitDetailId,
    //       id: 0,
    //       itemCardId: 0,
    //       transactionFactor: element.transactionFactor,
    //       sellingPrice: 0,
    //       minSellingPrice: 0,
    //       consumerPrice: 0,
    //       openingCostPrice: 0
    //     }
    //   )
    // });


  }
  getUnitDetail(unitId:any)
  {
    this.selectedUnit.transactionFactor=this.unitsList.transactionFactor;
  }

  addItem() {
    
    this.itemCardAlternative.push({
      id: 0,
      itemCardId: 0,
      alternativeItemId: this.selectedItemCardAlternative.alternativeItemId,
      sellingPrice: this.selectedItemCardAlternative.sellingPrice?? 0,
      alternativeType: this.selectedItemCardAlternative.alternativeType?? 0,
      costPrice: this.selectedItemCardAlternative.costPrice?? 0,
      currentBalance: this.selectedItemCardAlternative.currentBalance?? 0
    });

    
    this.itemCard!.itemCardAlternatives = this.itemCardAlternative;
    this.clearSelectedItemData();

  }
  clearSelectedItemData() {
    this.selectedItemCardAlternative = {
      id: 0,
      itemCardId: 0,
      alternativeItemId: 0,
      sellingPrice: 0,
      alternativeType: 0,
      costPrice: 0,
      currentBalance: 0

    }
  }

  deleteItem(index) {
    
    if (this.itemCardAlternative.length) {
      if (this.itemCardAlternative.length == 1) {
        this.itemCardAlternative = [];
      } else {
        this.itemCardAlternative.splice(index, 1);
      }
    }

    this.itemCard.itemCardAlternatives = this.itemCardAlternative;


  }


}


//#endregion


