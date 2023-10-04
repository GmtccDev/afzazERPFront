import { SalesPersonCardServiceProxy } from './../../../Services/sales-person-card.service';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountryDto } from 'src/app/erp/master-codes/models/country';
import { SalesPersonCardDto } from '../../../models/sales-person-card';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { TranslateService } from '@ngx-translate/core';
import { PublicService } from 'src/app/shared/services/public.service';
import { CountryServiceProxy } from 'src/app/erp/master-codes/services/country.servies';
import { Subscription } from 'rxjs';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { navigateUrl } from 'src/app/shared/helper/helper-url';
import { CODE_REQUIRED_VALIDATORS, PHONE_VALIDATORS, REQUIRED_VALIDATORS } from 'src/app/shared/constants/input-validators';

@Component({
  selector: 'app-add-sales-person-card',
  templateUrl: './add-sales-person-card.component.html',
  styleUrls: ['./add-sales-person-card.component.scss']
})
export class AddSalesPersonCardComponent implements OnInit {

   //#region Main Declarations
   salesPersonCardForm!: FormGroup;
   id: any = 0;
   currnetUrl;
   lang:any = localStorage.getItem("language")
   routeAccountApi = 'Account/get-ddl?'
   accountsList: any;
   routeApiCountry = 'Country/get-ddl?'
   countriesList: CountryDto[] = [];
   SalesPersonCard: SalesPersonCardDto[] = [];
   addUrl: string = '/warehouses-master-codes/sales-person-card/add-sales-person-card';
  updateUrl: string = '/warehouses-master-codes/sales-person-card/update-sales-person-card/';
  listUrl: string = '/warehouses-master-codes/sales-person-card';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.sales-person-card"),
    componentAdd: '',

  };
   response: any;
   errorMessage = '';
   errorClass = '';
   submited: boolean = false;
 
   constructor(
     private salesPersonCardService: SalesPersonCardServiceProxy,
     private router: Router,
     private fb: FormBuilder,
     private route: ActivatedRoute,
     private spinner: NgxSpinnerService,
     private sharedService: SharedService, private translate: TranslateService,
     private publicService: PublicService,
     private countryService: CountryServiceProxy,
 
 
 
   ) {
     this.definesalesPersonCardForm();
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
         this.getSalesPersonCardCode();
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
   definesalesPersonCardForm() {
     this.salesPersonCardForm = this.fb.group({
       id: 0,
       code: CODE_REQUIRED_VALIDATORS,
       nameAr: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
       nameEn: '',
       address: REQUIRED_VALIDATORS,
       isActive: true,
       phone: PHONE_VALIDATORS,
       fax: '',
       email: '',

       accountId: REQUIRED_VALIDATORS,
       countryId: ''
     }
 
     );
 
 
   }
 
   //#endregion
 
   //#region CRUD Operations
   getSupplierCardById(id: any) {
     return new Promise<void>((resolve, reject) => {
       let sub = this.salesPersonCardService.getSalesPersonCard(id).subscribe({
         next: (res: any) => {
           resolve();
           this.salesPersonCardForm.setValue({
             id: res.response?.id,
             code: res.response?.code,
             nameAr: res.response?.nameAr,
             nameEn: res.response?.nameEn,
             address: res.response?.address,
             phone: res.response?.phone,
             fax: res.response?.fax,
             email: res.response?.email,
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
   getSalesPersonCardCode() {
     return new Promise<void>((resolve, reject) => {
       let sub = this.salesPersonCardService.getLastCode().subscribe({
         next: (res: any) => {
           this.toolbarPathData.componentList = this.translate.instant("component-names.sales-person-card");
           this.salesPersonCardForm.patchValue({
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
     return this.salesPersonCardForm.controls;
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
            debugger
             this.sharedService.changeToolbarPath({
               listPath: this.listUrl,
             } as ToolbarPath);
             this.router.navigate([this.listUrl]);
           } else if (currentBtn.action == ToolbarActions.Save) {
             this.onSave();
           } else if (currentBtn.action == ToolbarActions.New) {
             this.toolbarPathData.componentAdd = this.translate.instant('component-names.add-supplier-card');
             this.definesalesPersonCardForm();
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
     var inputDto = new SalesPersonCardDto()
     return new Promise<void>((resolve, reject) => {
       inputDto = this.salesPersonCardForm.value;
       this.salesPersonCardService.createSalesPersonCard(inputDto).subscribe({
         next: (result: any) => {
           this.response = { ...result.response };
           this.definesalesPersonCardForm();
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
     if (this.salesPersonCardForm.valid) {
       this.spinner.show();
       this.confirmSave().then(a => {
         this.spinner.hide();
       }).catch(e => {
         this.spinner.hide();
       });
 
     } else {
 
       return this.salesPersonCardForm.markAllAsTouched();
     }
   }
   confirmUpdate() {
     var inputDto = new SalesPersonCardDto()
     return new Promise<void>((resolve, reject) => {
       inputDto = this.salesPersonCardForm.value;
       inputDto.id = this.id;
 
       let sub = this.salesPersonCardService.updateSalesPersonCard(inputDto).subscribe({
         next: (result: any) => {
           this.response = { ...result.response };
           this.definesalesPersonCardForm();
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
 
     if (this.salesPersonCardForm.valid) {
       this.spinner.show();
       this.confirmUpdate().then(a => {
         this.spinner.hide();
       }).catch(e => {
         this.spinner.hide();
       });
     }
     else {
       return this.salesPersonCardForm.markAllAsTouched();
 
     }
   }
 
 
 
  }
 
   //#endregion
 


