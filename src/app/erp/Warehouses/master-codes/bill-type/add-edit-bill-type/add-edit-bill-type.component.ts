import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { NgxSpinnerService } from 'ngx-spinner';
import { NAME_REQUIRED_VALIDATORS, REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { Subscription } from 'rxjs';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { PublicService } from '../../../../../shared/services/public.service';
import { NotificationsAlertsService } from '../../../../../shared/common-services/notifications-alerts.service';
import { BillTypeServiceProxy } from '../../../Services/bill-type.service';
import { ICustomEnum } from '../../../../../shared/interfaces/ICustom-enum';
import {
 
  BillKindArEnum,
  BillKindEnum,
  convertEnumToArray,

} from '../../../../../shared/constants/enumrators/enums';

@Component({
  selector: 'app-add-edit-bill-type',
  templateUrl: './add-edit-bill-type.component.html',
  styleUrls: ['./add-edit-bill-type.component.scss']
})
export class AddEditBillTypeComponent implements OnInit {
  //#region Main Declarations
  billTypeForm!: FormGroup;
  billKinds: ICustomEnum[] = [];
  warehouseEffectList: { nameAr: string; nameEn: string; value: string; }[];

  journalList: any;
  id: any = 0;

  currnetUrl;
  public show: boolean = false;
  lang = localStorage.getItem("language")
  accountClassification: [] = [];
  addUrl: string = '/warehouses-master-codes/billType/add-billType';
  updateUrl: string = '/warehouses-master-codes/billType/update-billType/';
  listUrl: string = '/warehouses-master-codes/billType';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.bill-types"),
    componentAdd: '',

  };
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  showSearchJournalModal = false;
  showSearchAccountModal = false;
  showSearchCurrencyModal = false;

  routeJournalApi = "journal/get-ddl?"
  routeCurrencyApi = "currency/get-ddl?"

  
  companyId: any = localStorage.getItem("companyId");
  branchId: any = localStorage.getItem("branchId");


  constructor(
    private billTypeService: BillTypeServiceProxy,
    private publicService: PublicService,
    private AlertsService: NotificationsAlertsService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,

  ) {
    this.defineBillTypeForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.getBillKind();
    this.getWarehouseEffect();

    this.spinner.show();
    Promise.all([
      this.getJournal()

    ]).then(a => {
      this.getRouteData();
      this.changePath();
      this.listenToClickedButton();
    }).catch((err) => {

      this.spinner.hide();
    })




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
  defineBillTypeForm() {
    this.billTypeForm = this.fb.group({
      id: 0,
      companyId: this.companyId,
      branchId: this.branchId,
      billKind:'',
      billNameAr: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(250)])],
      billNameEn: '',
      warehouseEffect: REQUIRED_VALIDATORS,
      affectOnCostPrice: false,
      accountingEffect: REQUIRED_VALIDATORS,
      postingToAccountsAutomatically: false,
      codingPolicy: REQUIRED_VALIDATORS,
      confirmCostCenter: false,
      confirmAnalyticalCode: false,
      notCalculatingTax: false,
      calculatingValueAddedTaxAfterLuxuryTax: false,
      calculatingTaxOnPriceAfterDeductionAndAddition: false,
      discountAffectsCostPrice: false,
      additionAffectsCostPrice: false,
      defaultCurrencyId: '',
      defaultUnitId: '',
      storeId: '',
      costCenterId: '',
      paymentMethodId: '',
      vendorId: '',
      projectId: '',
      defaultPrice: '',
      printImmediatelyAfterAddition: false,
      printExpiryDates: false,
      printItemsSpecifiers: false,
      printItemsImages: false,
    });

  }


  //#endregion

  //#region CRUD Operations
  getRouteData() {
    let sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];
        if (this.id > 0) {
          this.getBillTypeById(this.id).then(a => {
            this.spinner.hide();

          }).catch(err => {
            this.spinner.hide();

          });


        }
        else {
          this.sharedServices.changeButton({ action: 'New' } as ToolbarData);
          this.spinner.hide();
        }
      }
      else {
        this.spinner.hide();
        this.sharedServices.changeButton({ action: 'New' } as ToolbarData);
      }
    });
    this.subsList.push(sub);

  }

  getBillTypeById(id: any) {
    const promise = new Promise<void>((resolve, reject) => {
      this.billTypeService.getBillType(id).subscribe({
        next: (res: any) => {
          resolve();
          this.billTypeForm.setValue({
            id: res.response?.id,
            companyId: res.response?.companyId,
            branchId: res.response?.branchId,
            billKind:res.response?.billKind,
            billNameAr: res.response?.billNameAr,
            billNameEn: res.response?.billNameEn,
            warehouseEffect: res.response?.warehouseEffect,
            affectOnCostPrice: res.response?.affectOnCostPrice,
            accountingEffect: res.response?.accountingEffect,
            postingToAccountsAutomatically: res.response?.postingToAccountsAutomatically,
            codingPolicy: res.response?.codingPolicy,
            confirmCostCenter: res.response?.confirmCostCenter,
            confirmAnalyticalCode: res.response?.confirmAnalyticalCode,
            notCalculatingTax: res.response?.notCalculatingTax,
            calculatingValueAddedTaxAfterLuxuryTax: res.response?.calculatingValueAddedTaxAfterLuxuryTax,
            calculatingTaxOnPriceAfterDeductionAndAddition: res.response?.calculatingTaxOnPriceAfterDeductionAndAddition,
            discountAffectsCostPrice: res.response?.discountAffectsCostPrice,
            additionAffectsCostPrice: res.response?.additionAffectsCostPrice,
            defaultCurrencyId:res.response?.defaultCurrencyId,
            defaultUnitId: res.response?.defaultUnitId,
            storeId:res.response?.storeId,
            costCenterId: res.response?.costCenterId,
            paymentMethodId: res.response?.paymentMethodId,
            vendorId: res.response?.vendorId,
            projectId: res.response?.projectId,
            defaultPrice:res.response?.defaultPrice,
            printImmediatelyAfterAddition:res.response?.printImmediatelyAfterAddition,
            printExpiryDates: res.response?.printExpiryDates,
            printItemsSpecifiers: res.response?.printItemsSpecifiers,
            printItemsImages: res.response?.printItemsImages



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
    return promise;
  }
  getJournal() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeJournalApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.journalList = res.response;

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
 
  getBillKind() {
    if (this.lang == 'en') {
      this.billKinds = convertEnumToArray(BillKindEnum);
    }
    else {
      this.billKinds = convertEnumToArray(BillKindArEnum);

    }
  }
  getWarehouseEffect() {
    this.warehouseEffectList = [
      { nameAr: ' ليس لها تأثير مستودعى', nameEn: 'It has no warehouse effect', value: '1' },
      { nameAr: 'لا ترحل إلى المستودع تلقائياً', nameEn: 'No post to the warehouses automatically', value: '2' },
      { nameAr: 'ترحل إلى المستودعات تلقائياً', nameEn: 'Post to the warehouses automatically', value: '3' }

    ];
  }
 
  //#endregion

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.billTypeForm.controls;
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
          } else if (currentBtn.action == ToolbarActions.New) {
            this.toolbarPathData.componentAdd = this.translate.instant("bill-type.add-bill-type");
            this.defineBillTypeForm();
            this.sharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update) {
            this.onUpdate();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.sharedServices.changeToolbarPath(this.toolbarPathData);
  }
  confirmSave() {
    return new Promise<void>((resolve, reject) => {
      var entity = this.billTypeForm.value;

      let sub = this.billTypeService.createBillType(entity).subscribe({
        next: (result: any) => {
          this.spinner.show();

          this.defineBillTypeForm();

          this.submited = false;
          this.spinner.hide();
          this.router.navigate([this.listUrl])
            .then(() => {
              window.location.reload();
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
  onSave() {
    
    if (this.billTypeForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {
      this.errorMessage = this.translate.instant("validation-messages.invalid-data");
      this.errorClass = 'errorMessage';
      this.AlertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return this.billTypeForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    this.billTypeForm.value.id = this.id;
    var entityDb = this.billTypeForm.value;
    entityDb.id = this.id;

    return new Promise<void>((resolve, reject) => {

      this.billTypeService.updateBillType(entityDb).subscribe({
        next: (result: any) => {
          this.spinner.show();

          this.defineBillTypeForm();
          this.submited = false;
          this.spinner.hide();

          this.router.navigate([this.listUrl])
            .then(() => {
              window.location.reload();
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

  onUpdate() {

    if (this.billTypeForm.valid) {

      this.spinner.show();
      this.confirmUpdate().then(a=>{
        this.spinner.hide();
      }).catch(e=>{
        this.spinner.hide();
      });
    }

    else {

      this.errorMessage = this.translate.instant("validation-messages.invalid-data");
      this.errorClass = 'errorMessage';
      this.AlertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return this.billTypeForm.markAllAsTouched();
    }
  }

 
}

