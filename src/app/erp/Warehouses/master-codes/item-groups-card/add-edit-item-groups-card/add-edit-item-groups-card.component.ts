import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { ItemGroupsCardServiceProxy } from '../../../Services/item-groups-card.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { TranslateService } from '@ngx-translate/core';
import { CODE_REQUIRED_VALIDATORS, NAME_REQUIRED_VALIDATORS } from 'src/app/shared/constants/input-validators';
import { Subscription } from 'rxjs';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { ItemGroupsCardDto } from '../../../models/item-groups-card';
import { navigateUrl } from 'src/app/shared/helper/helper-url';
import { ItemTypeEnum, ItemTypeArEnum, CostCalculateMethodsEnum, CostCalculateMethodsArEnum, convertEnumToArray, LifeTimeTypeEnum, LifeTimeTypeArEnum } from '../../../../../shared/constants/enumrators/enums';
import { ICustomEnum } from 'src/app/shared/interfaces/ICustom-enum';
import { PublicService } from 'src/app/shared/services/public.service';

@Component({
  selector: 'app-add-edit-item-groups-card',
  templateUrl: './add-edit-item-groups-card.component.html',
  styleUrls: ['./add-edit-item-groups-card.component.scss']
})
export class AddEditItemGroupsCardComponent implements  OnInit {
  //#region Main Declarations
  itemGroupsCardForm!: FormGroup;
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  public show: boolean = false;
  lang = localStorage.getItem("language")
  addUrl: string = '/warehouses-master-codes/itemGroupsCard/add-itemGroupsCard';
  addParentUrl: string = '/warehouses-master-codes/itemGroupsCard/add-itemGroupsCard/';
  updateUrl: string = '/warehouses-master-codes/itemGroupsCard/update-itemGroupsCard/';
  listUrl: string = '/warehouses-master-codes/itemGroupsCard';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.item-groups-card"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  itemGroupsCardList: [] = [];
  files: any;
  logoPath: string;
  fullPathUpdate: string;
  logo: any;
  showSearchModal = false;
  parentId: any;
  routeApi = 'ItemGroupsCard/get-ddl?'
  routeUnitApi = 'Unit/get-ddl?'
  itemTypeEnum: ICustomEnum[] = [];
  costCalculateMethodsEnum: ICustomEnum[] = [];
  unitsList: any;
  constructor(
    private itemGroupsCardService: ItemGroupsCardServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,  private publicService: PublicService,
    private sharedServices: SharedService, private translate: TranslateService,

  ) {
    this.defineitemGroupsCardForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.getItemTypeEnum();
    this.getCostCalculateMethodsEnum();
    this.spinner.show();
    Promise.all([
      this.getItemGroupsCard(),
      this.getUnits()
    ]).then(a => {
      
      this.getRouteData();
      this.changePath();
      this.listenToClickedButton();
      this.currnetUrl = this.router.url;
      if (this.currnetUrl == this.addUrl) {
        this.getitemGroupsCardCode();
      }
      this.spinner.hide();
    }).catch(err => {
      
      this.spinner.hide();
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
          //console.log('complete');
        },
      });

      this.subsList.push(sub);
    });

  }
  getRouteData() {
    let sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
          this.getitemGroupsCardById(this.id).then(a => {
            this.spinner.hide();
          }).catch(err => {
            this.spinner.hide();

          });
        }
        this.url = this.router.url.split('/')[2];
        this.spinner.hide();
      }
      if (params['parentId'] != null) {
        this.parentId = params['parentId'];

        this.getitemGroupsCardCode();
        this.url = this.router.url.split('/')[2];
      }
    });
    this.subsList.push(sub);
  }
  onSelectItemGroupsCard(event) {

    this.parentId = event.id;
    this.itemGroupsCardForm.controls.parentId.setValue(event.id);
    this.showSearchModal = false;
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

  //#region Subscriptionss

  //#endregion

  //#region  State Management
  //#endregion

  //#region Basic Data
  ///Geting form dropdown list data
  defineitemGroupsCardForm() {
    this.itemGroupsCardForm = this.fb.group({
      id: 0,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: null,
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      parentId: null,
      itemType: null,
      costCalculation: null,
      notes:null,
      unitId:null
    });

  }

  getItemGroupsCard() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.itemGroupsCardService.getDdl().subscribe({
        next: (res) => {

          if (res.success) {
            this.itemGroupsCardList = res.response;

          }
          if (this.parentId != undefined || this.parentId != null) {
            this.itemGroupsCardForm.controls.parentId.setValue(Number(this.parentId));
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

  //#region CRUD Operations
  getitemGroupsCardById(id: any) {

    return new Promise<void>((resolve, reject) => {
      let sub = this.itemGroupsCardService.getItemGroupsCard(id).subscribe({
        next: (res: any) => {
          resolve();
          this.itemGroupsCardForm.setValue({
            id: res.response?.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive,
            parentId: res.response?.parentId,
            itemType: res.response?.itemType,
            costCalculation: res.response?.costCalculation,
            notes:res.response?.notes,
            unitId:res.response?.unitId,
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
  showPassword() {
    this.show = !this.show;
  }
  getitemGroupsCardCode() {

    return new Promise<void>((resolve, reject) => {

      let sub = this.itemGroupsCardService.getLastCode(this.parentId).subscribe({

        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.item-groups-card");
          this.itemGroupsCardForm.patchValue({
            code: res.response
          });
          if (this.parentId != undefined || this.parentId != null) {
            this.itemGroupsCardForm.controls.parentId.setValue(Number(this.parentId));
          }

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });
      this.subsList.push(sub);

    });
  }
  //#endregion

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.itemGroupsCardForm.controls;
  }


  //#endregion
  //#region Tabulator
  subsList: Subscription[] = [];
  currentBtnResult;
  listenToClickedButton() {
    let sub = this.sharedServices.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {
        currentBtn;

        if (currentBtn != null) {
          if (currentBtn.action == ToolbarActions.List) {
            this.sharedServices.changeToolbarPath({
              listPath: this.listUrl,
            } as ToolbarPath);
            this.router.navigate([this.listUrl]);
          } else if (currentBtn.action == ToolbarActions.Save) {
            this.onSave();
          } else if (currentBtn.action == ToolbarActions.New || this.currnetUrl == this.addParentUrl) {
            this.toolbarPathData.componentAdd = 'store-cards.add-store-card';
            if (this.itemGroupsCardForm.value.code != null) {
              this.getitemGroupsCardCode()
            }
            this.defineitemGroupsCardForm();
            this.sharedServices.changeToolbarPath(this.toolbarPathData);
          }else if (currentBtn.action == ToolbarActions.Update && currentBtn.submitMode) {
            this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
           this.getitemGroupsCardCode();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.sharedServices.changeToolbarPath(this.toolbarPathData);
  }
  onSave() {
    if (this.itemGroupsCardForm.valid) {

      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      });


    } else {

       return this.itemGroupsCardForm.markAllAsTouched();
    }
  }
  confirmSave() {
    var entity = new ItemGroupsCardDto();
    return new Promise<void>((resolve, reject) => {
      entity = this.itemGroupsCardForm.value;
      let sub = this.itemGroupsCardService.createItemGroupsCard(entity).subscribe({
        next: (result: any) => {
          this.spinner.show();
          console.log('result dataaddData ', result);
          this.response = { ...result.response };
          this.defineitemGroupsCardForm();
          this.submited = false;
          this.spinner.hide();
          navigateUrl(this.listUrl, this.router);
        },
        error: (err: any) => {
          reject(err);
          this.spinner.hide();
        },
        complete: () => {
          //console.log('complete');
        },
      });
      this.subsList.push(sub);
    });
  }


  onUpdate() {
    if (this.itemGroupsCardForm.valid) {

      this.itemGroupsCardForm.value.id = this.id;
      this.spinner.show();
      this.confirmUpdate().then(a=>{
        this.spinner.hide();
      }).catch(e=>{
        this.spinner.hide();
      });
    }

    else {

      return this.itemGroupsCardForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    var entity = new ItemGroupsCardDto();
    entity = this.itemGroupsCardForm.value;
    entity.id = this.id;
    return new Promise<void>((resolve, reject) => {
      let sub = this.itemGroupsCardService.updateItemGroupsCard(entity).subscribe({
        next: (result: any) => {
          this.spinner.show();
          console.log('result update ', result);
          this.response = { ...result.response };
          this.defineitemGroupsCardForm();
          this.submited = false;
          this.spinner.hide();
          navigateUrl(this.listUrl, this.router);
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });
      this.subsList.push(sub);

    });
  }
}




