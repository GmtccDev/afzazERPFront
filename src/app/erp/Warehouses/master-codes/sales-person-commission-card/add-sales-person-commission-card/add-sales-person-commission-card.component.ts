import { SalesPersonCardServiceProxy } from './../../../Services/sales-person-card.service';
import { SalesPersonCommissionServiceProxy } from './../../../Services/sales-person-commission.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { TranslateService } from '@ngx-translate/core';
import { PublicService } from 'src/app/shared/services/public.service';
import { SalesPersonCommissionCardDto } from '../../../models/sales-person-commission-card';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { CODE_REQUIRED_VALIDATORS, PHONE_VALIDATORS, REQUIRED_VALIDATORS } from 'src/app/shared/constants/input-validators';
import { Subscription } from 'rxjs';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { navigateUrl } from 'src/app/shared/helper/helper-url';
import { SalesPersonCardDto } from '../../../models/sales-person-card';
import { CommissionTypeArEnum, CommissionTypeEnum, calculationMethodsArEnum, calculationMethodsEnum, convertEnumToArray } from 'src/app/shared/constants/enumrators/enums';

@Component({
  selector: 'app-add-sales-person-commission-card',
  templateUrl: './add-sales-person-commission-card.component.html',
  styleUrls: ['./add-sales-person-commission-card.component.scss']
})
export class AddSalesPersonCommissionCardComponent  implements OnInit,OnDestroy {

  //#region Main Declarations
  salesPersonCommissionCardForm!: FormGroup;
  id: any = 0;
  currnetUrl;
  lang:any = localStorage.getItem("language")
  accountsList: any;


  SalesPersonCommissionCard: SalesPersonCommissionCardDto[] = [];
  salesPersons: SalesPersonCardDto[] = [];
  addUrl: string = '/warehouses-master-codes/sales-person-card/add-sales-person-commission-card';
 updateUrl: string = '/warehouses-master-codes/sales-person-card/update-sales-person-commission-card/';
 listUrl: string = '/warehouses-master-codes/sales-person-commission-card';
 toolbarPathData: ToolbarPath = {
   listPath: '',
   updatePath: this.updateUrl,
   addPath: this.addUrl,
   componentList: this.translate.instant("component-names.sales-person-commission"),
   componentAdd: '',

 };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;

  constructor(
    private salesPersonCommissionServiceProxy: SalesPersonCommissionServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedService: SharedService, private translate: TranslateService,
    private publicService: PublicService,
    private salesPersonCardService:SalesPersonCardServiceProxy
 



  ) {
    this.definesalesPersonCardForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    ;
    Promise.all([
    
      this.getSalesPersons(),
      this.getCommissionTypeList(),
      this.getCalculationMethodsList(),
      this.getCommissionOnList(),


    ]).then(a => {
      this.getRouteData();
      this.currnetUrl = this.router.url;
      if (this.currnetUrl == this.addUrl) {
        this.getSalesPersonCommissionCardCode();
        this.getSelecteditem();
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
          this.getSalesPersonCommissionCardId(this.id).then(a => {
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
  definesalesPersonCardForm() {
    this.salesPersonCommissionCardForm = this.fb.group({
      id: 0,
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      salesPersonId: '',
      calculationMethod:'',
      type: '',
      target: '',
      commissionOn: 1,
      achievedTargetRatio: '',
      notAchievedTargetRatio:'' ,
    }

    );


  }


  //#endregion

  //#region CRUD Operations
  getSalesPersonCommissionCardId(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.salesPersonCommissionServiceProxy.getSalesPersonCommission(id).subscribe({
        next: (res: any) => {
       
          resolve();
          this.salesPersonCommissionCardForm.patchValue({
            id: res.response?.id,
            code:res.response?.code,
            isActive: res.response?.isActive,
            salesPersonId: res.response?.salesPersonId,
            calculationMethod:res.response?.calculationMethod,
            type: res.response?.type,
            target: res.response?.target,
            commissionOn: res.response?.commissionOn,
            achievedTargetRatio: res.response?.achievedTargetRatio,
            notAchievedTargetRatio:res.response?.notAchievedTargetRatio ,

          });


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
  getSalesPersonCommissionCardCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.salesPersonCommissionServiceProxy.getLastCode().subscribe({
        next: (res: any) => {
          this.toolbarPathData.componentList = this.translate.instant("component-names.sales-person-commission");
          this.salesPersonCommissionCardForm.patchValue({
            code: res.response
          });

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
  getSalesPersons() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.salesPersonCardService.getDdl().subscribe({
        next: (res) => {
          
          this.salesPersons=res.response;
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
  commissionTypeList:any[]=[]

  getCommissionTypeList() {
    if (this.lang == 'en') {
      this.commissionTypeList = convertEnumToArray(CommissionTypeEnum);
    }
    else {
      this.commissionTypeList = convertEnumToArray(CommissionTypeArEnum);

    }
  }
  calculationMethodsList:any[]=[]

  getCalculationMethodsList() {
    if (this.lang == 'en') {
      this.calculationMethodsList = convertEnumToArray(calculationMethodsEnum);
    }
    else {
      this.calculationMethodsList = convertEnumToArray(calculationMethodsArEnum);

    }
  }
  commissionOn
  commissionOnList:any[]=[]
  getCommissionOnList() {
    this.commissionOnList = [
      { nameAr: 'المبيعات', nameEn: 'Sales',value: '1' },
      { nameAr: 'التحصيل', nameEn: 'Collection', value: '2' },

    ];
  }
  radioSel: any;
  radioSelectedString: string;
  commissionOnSelected
  getSelecteditem() {
    this.radioSel = this.commissionOnList.find(Item => Item.value === this.commissionOnSelected);
    this.radioSelectedString = JSON.stringify(this.radioSel);
  }
  onItemChange(item) {
    this.getSelecteditem();
  }
 

  //#endregion

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.salesPersonCommissionCardForm.controls;
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
            this.toolbarPathData.componentAdd = this.translate.instant('component-names.add-sales-person-commission');
            if (this.salesPersonCommissionCardForm.value.code != null) {
             this.getSalesPersonCommissionCardCode()
           }
            this.definesalesPersonCardForm();
            this.sharedService.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update) {
            this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
           this.getSalesPersonCommissionCardCode();
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

    
    var inputDto = new SalesPersonCommissionCardDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.salesPersonCommissionCardForm.value;
      this.salesPersonCommissionServiceProxy.createSalesPersonCommission(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          
          navigateUrl(this.listUrl, this.router);
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });
    });
  }
  onSave() {
    if (this.salesPersonCommissionCardForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.salesPersonCommissionCardForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    
    console.log("this.salesPersonCommissionCardForm.value",this.salesPersonCommissionCardForm.value)
    var inputDto = new SalesPersonCommissionCardDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.salesPersonCommissionCardForm.value;
      inputDto.id = this.id;

      let sub = this.salesPersonCommissionServiceProxy.updateSalesPersonCommission(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
     
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

  onUpdate() {

    if (this.salesPersonCommissionCardForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }
    else {
      return this.salesPersonCommissionCardForm.markAllAsTouched();

    }
  }



 }

  //#endregion
