import { SubTaxRatioDetail, SubTaxReasonsDetail } from './../../../models/tax';
import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { CODE_REQUIRED_VALIDATORS, REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { PublicService } from '../../../../../shared/services/public.service';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { NotificationsAlertsService } from '../../../../../shared/common-services/notifications-alerts.service';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { DateCalculation, DateModel } from '../../../../../shared/services/date-services/date-calc.service';
import { SubTaxDetail, TaxDetail, TaxMaster } from '../../../models/tax';
import { TaxServiceProxy } from '../../../Services/tax.service';
import { formatDate, navigateUrl } from '../../../../../shared/helper/helper-url';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-add-edit-tax',
  templateUrl: './add-edit-tax.component.html',
  styleUrls: ['./add-edit-tax.component.scss']
})

export class AddEditTaxComponent implements OnInit, AfterViewInit {
  //#region Main Declarations
  @ViewChild('dialogSubTaxReasonContent') dialogSubTaxReasonContent!: TemplateRef<any>;
  @ViewChild('dialogSubTaxRatioContent') dialogSubTaxRatioContent!: TemplateRef<any>;
  taxForm: FormGroup = new FormGroup({});
  companyId: any = localStorage.getItem("companyId");
  branchId: any = localStorage.getItem("branchId");
  accountId: any;
  fromDate!: DateModel;
  toDate!: DateModel;
  showSearchAccountModal = false;
  taxMaster: TaxMaster = new TaxMaster();
  taxDetail: TaxDetail[] = [];
  selectedTaxDetail: TaxDetail = new TaxDetail();
  subTaxDetail: SubTaxDetail[] = [];
  subTaxRatioDetail: SubTaxRatioDetail[]=[] ;
  selectedSubTaxRatioDetail:SubTaxRatioDetail = new SubTaxRatioDetail ;
  selectedSubTaxReasonDetail:SubTaxReasonsDetail = new SubTaxReasonsDetail ;
  subTaxReasonDetail: SubTaxReasonsDetail[] = [];
  selectedSubTaxDetail: SubTaxDetail = new SubTaxDetail();

  id: any = 0;
  currnetUrl;
  errorMessage = '';
  errorClass = '';
  lang = localStorage.getItem("language")
  routeAccountApi = 'Account/GetLeafAccounts?'
  accountsList: any;
  submitMode: boolean = false;
  addUrl: string = '/warehouses-master-codes/tax/add-tax';
  updateUrl: string = '/warehouses-master-codes/tax/update-tax/';
  listUrl: string = '/warehouses-master-codes/tax/';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.taxes"),
    componentAdd: '',

  };

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private publicService: PublicService,
    private taxService: TaxServiceProxy,
    private dateService: DateCalculation,
    private dialog: MatDialog,
    private sharedService: SharedService,
    private alertsService: NotificationsAlertsService,

  ) {
    this.defineTaxForm();
    this.clearSelectedItemData();
    this.clearSelectedSubTaxRatioItemData();
    this.clearSelectedSubTaxReasonItemData();
    this.taxDetail = [];

  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    Promise.all([
      this.getAccounts()

    ]).then(a => {
      this.getRouteData();
      this.changePath();
      this.listenToClickedButton();
    }).catch((err) => {

      this.spinner.hide();
    })


  }
  getRouteData() {
    let sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];
        if (this.id) {
          this.getTaxById(this.id).then(a => {
            this.sharedService.changeButton({ action: 'Update',submitMode:false } as ToolbarData);
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
        this.getTaxCode();
        this.sharedService.changeButton({ action: 'New' } as ToolbarData);
        this.spinner.hide();
      }
    });
    this.subsList.push(sub);

  }

  //#endregion
  ngAfterViewInit(): void {

  }
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
  defineTaxForm() {
    this.taxForm = this.fb.group({
      id: 0,
      //subTaxCode:'',
      companyId: this.companyId,
      branchId: this.branchId,
      nameAr: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(100)])],
      nameEn: '',
      code: CODE_REQUIRED_VALIDATORS,
      accountId: REQUIRED_VALIDATORS,
      isActive: true,

    });

  }

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.taxForm.controls;
  }


  //#endregion

  getTaxById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.taxService.getTax(id).subscribe({
        next: (res: any) => {
          resolve();
          

         
          this.taxForm.setValue({
            id: res.response.id,
            companyId: res.response?.companyId,
            branchId: res.response?.branchId,
            code: res.response.code,
            nameAr: res.response.nameAr,
            nameEn: res.response?.nameEn,
            accountId: res.response.accountId,
            isActive: res.response?.isActive,
          });
          this.taxDetail = res.response?.taxDetail;
          this.subTaxDetail = res.response?.subTaxDetail;
       
          let subTaxRatioDetailObj:SubTaxRatioDetail=new SubTaxRatioDetail();
          let subTaxRatioDetailList = this.subTaxDetail.reduce((result: SubTaxRatioDetail[], subTaxDetail: SubTaxDetail) =>result.concat(subTaxDetail.subTaxRatioDetail),[]);
          let index = 0;
          subTaxRatioDetailList.forEach(element => {
            subTaxRatioDetailObj.fromDate = element.fromDate;
            subTaxRatioDetailObj.id=element.id;
            subTaxRatioDetailObj.subTaxId = element.subTaxId;
            subTaxRatioDetailObj.toDate = element.toDate;
            subTaxRatioDetailObj.taxRatio = element.taxRatio;
          
            
          });
          let subTaxReasonDetailObj:SubTaxReasonsDetail=new SubTaxReasonsDetail();
          let subTaxReasonDetailList = this.subTaxDetail.reduce((result: SubTaxReasonsDetail[], subTaxDetail: SubTaxDetail) =>result.concat(subTaxDetail.subTaxReasonsDetail),[]);
          subTaxReasonDetailList.forEach(element => {
            subTaxReasonDetailObj.taxReasonAr =element.taxReasonAr;
            subTaxReasonDetailObj.id=element.id;
            subTaxReasonDetailObj.code=element.code;
            subTaxReasonDetailObj.subTaxId = element.subTaxId;
            subTaxReasonDetailObj.taxReasonEn = element.taxReasonEn;
            this.subTaxReasonDetail.push(subTaxReasonDetailObj);
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


  getTaxCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.taxService.getLastCode().subscribe({
        next: (res: any) => {
          resolve();

          this.taxForm.patchValue({
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


  onSelectAccount(event) {
    this.taxForm.controls.accountId.setValue(event.id);
    this.showSearchAccountModal = false;
  }


  addItem() {
    
    var result: boolean = false;
   
    if (this.taxDetail.length > 0 && this.taxDetail != null) {
      this.taxDetail.forEach(element => {

        let fromDate = element.fromDate;
        let toDate = element.toDate;
        let date;
        let month;
        let day;
        if (this.selectedTaxDetail?.fromDate.month + 1 > 9) {
          month = this.selectedTaxDetail?.fromDate.month + 1
        }
        else {
          month = '0' + this.selectedTaxDetail?.fromDate.month + 1
        }
        if (this.selectedTaxDetail?.fromDate.day < 10) {
          day = '0' + this.selectedTaxDetail?.fromDate.day
        }
        else {
          day = this.selectedTaxDetail?.fromDate.day
        }
        date = this.selectedTaxDetail?.fromDate.year + '-' + month + '-' + day

        if (date >= fromDate && date <= toDate) {

          this.errorMessage = this.translate.instant("tax.date-exist");
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          result = true;
          return result;
        }


      });
      if (result == false) {
        this.taxDetail.push({
          id: 0,
          taxId: this.selectedTaxDetail?.taxId ?? 0,
          fromDate: formatDate(this.dateService.getDateForInsert(this.selectedTaxDetail?.fromDate)),
          toDate: formatDate(this.dateService.getDateForInsert(this.selectedTaxDetail?.toDate)),
          taxRatio: this.selectedTaxDetail?.taxRatio ?? 0,

        });
        this.taxMaster!.taxDetail = this.taxDetail;
        this.clearSelectedItemData();
        return;
      }

    }
    else {
      this.taxDetail.push({
        id: 0,
        taxId: this.selectedTaxDetail?.taxId ?? 0,
        fromDate: formatDate(this.dateService.getDateForInsert(this.selectedTaxDetail?.fromDate)),
        toDate: formatDate(this.dateService.getDateForInsert(this.selectedTaxDetail?.toDate)),
        taxRatio: this.selectedTaxDetail?.taxRatio ?? 0,

      });
      this.taxMaster!.taxDetail = this.taxDetail;
      this.clearSelectedItemData();
    }

  }
  deleteItem(index) {
    if (this.taxDetail.length) {
      if (this.taxDetail.length == 1) {
        this.taxDetail = [];
      } else {
        this.taxDetail.splice(index, 1);
      }
    }

    this.taxMaster.taxDetail = this.taxDetail;


  }
  addSubTaxItem() {
	  
		var errorStatus: boolean = false;
    
    if (!this.selectedSubTaxDetail.code) {

      this.errorMessage = this.translate.instant("tax.sub-code-tax-required");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      errorStatus = true;
      return errorStatus;
    }
    if(!errorStatus)
    {
      this.subTaxDetail.push({
        id:0,
        code:this.selectedSubTaxDetail?.code??0,
        subTaxNameAr:this.selectedSubTaxDetail?.subTaxNameAr??'',
        subTaxNameEn:this.selectedSubTaxDetail?.subTaxNameEn??'',
        taxId:this.selectedSubTaxDetail?.taxId??0,
        subTaxRatioDetail:this.subTaxRatioDetail??[],
        subTaxReasonsDetail:this.subTaxReasonDetail??[]
      
      });
      this.taxMaster!.subTaxDetail = this.subTaxDetail;
      this.clearSelectedItemData();
    }
		
	  

	}
	deleteSubTaxItem(index) {
	  if (this.subTaxDetail.length) {
		if (this.subTaxDetail.length == 1) {
		  this.subTaxDetail = [];
		} else {
		  this.subTaxDetail.splice(index, 1);
		}
	  }
  
	  this.taxMaster.subTaxDetail = this.subTaxDetail;
  
  
	}

  addSubTaxReasonItem() {
	  
		var errorStatus: boolean = false;
    
    if (!this.selectedSubTaxReasonDetail.code) {

      this.errorMessage = this.translate.instant("tax.sub-code-tax-required");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      errorStatus = true;
      return errorStatus;
    }
    if(!errorStatus)
    {
      this.subTaxReasonDetail.push({
        id:0,
        code:this.selectedSubTaxReasonDetail?.code??'',
        taxReasonAr:this.selectedSubTaxReasonDetail?.taxReasonAr??'',
        taxReasonEn:this.selectedSubTaxReasonDetail?.taxReasonEn??'',
        subTaxId:this.selectedSubTaxReasonDetail.subTaxId??0
  
      
      });
      this.clearSelectedSubTaxReasonItemData();
    }
		
	  

	}
	deleteSubTaxReasonItem(index) {
	  if (this.subTaxReasonDetail.length) {
		if (this.subTaxReasonDetail.length == 1) {
		  this.subTaxReasonDetail = [];
		} else {
		  this.subTaxReasonDetail.splice(index, 1);
		}
	  }
  
	
  
  
	}


  addSubTaxRatioItem() {
    console.log("subtaxdetial before",this.subTaxDetail)
    var result: boolean = false;
     
    if (this.subTaxRatioDetail.length > 0 && this.subTaxRatioDetail != null) {
      this.subTaxRatioDetail.forEach(element => {

        let fromDate = element.fromDate;
        let toDate = element.toDate;
        let date;
        let month;
        let day;
        if (this.selectedSubTaxRatioDetail?.fromDate.month + 1 > 9) {
          month = this.selectedSubTaxRatioDetail?.fromDate.month + 1
        }
        else {
          month = '0' + this.selectedSubTaxRatioDetail?.fromDate.month + 1
        }
        if (this.selectedSubTaxRatioDetail?.fromDate.day < 10) {
          day = '0' + this.selectedSubTaxRatioDetail?.fromDate.day
        }
        else {
          day = this.selectedSubTaxRatioDetail?.fromDate.day
        }
        date = this.selectedSubTaxRatioDetail?.fromDate.year + '-' + month + '-' + day

        if (date >= fromDate && date <= toDate) {

          this.errorMessage = this.translate.instant("tax.date-exist");
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          result = true;
          return result;
        }


      });
      if (result == false) {
        this.subTaxRatioDetail.push({
          id: 0,
          subTaxId: this.selectedSubTaxRatioDetail?.subTaxId ?? 0,
          fromDate: formatDate(this.dateService.getDateForInsert(this.selectedSubTaxRatioDetail?.fromDate)),
          toDate: formatDate(this.dateService.getDateForInsert(this.selectedSubTaxRatioDetail?.toDate)),
          taxRatio: this.selectedSubTaxRatioDetail?.taxRatio ?? 0,

        });
        this.subTaxDetail.forEach(elment => {
          elment.subTaxRatioDetail=this.subTaxRatioDetail;
         });
    

        this.clearSelectedSubTaxRatioItemData();
        return;
      }

    }
  
    else {
      this.subTaxRatioDetail.push({
        id: 0,
        subTaxId: this.selectedSubTaxRatioDetail?.subTaxId ?? 0,
        fromDate: formatDate(this.dateService.getDateForInsert(this.selectedSubTaxRatioDetail?.fromDate)),
        toDate: formatDate(this.dateService.getDateForInsert(this.selectedSubTaxRatioDetail?.toDate)),
        taxRatio: this.selectedSubTaxRatioDetail?.taxRatio ?? 0,

      });
      this.subTaxDetail.forEach(elment => {
        elment.subTaxRatioDetail=this.subTaxRatioDetail;
       });
      //this.subTaxDetail['subTaxRatioDetail'] = this.subTaxRatioDetail;
      this.clearSelectedSubTaxRatioItemData();
    }
  }


  
  deleteSubTaxRatioItem(index) {
    if (this.subTaxRatioDetail.length) {
      if (this.subTaxRatioDetail.length == 1) {
        this.subTaxRatioDetail = [];
      } else {
        this.subTaxRatioDetail.splice(index, 1);
      }
    }

   // this.subTaxDetail["subTaxReasonsDetail"] = this.subTaxRatioDetail;


  }
  clearSelectedItemData() {
    this.selectedTaxDetail = {
      id: 0,
      taxId: 0,
      fromDate: this.dateService.getCurrentDate(),
      toDate: this.dateService.getCurrentDate(),
      taxRatio: 0

    };
    this.selectedSubTaxDetail = {
      id: 0,
      taxId: 0,
      subTaxNameAr:'',
      subTaxNameEn:'',
      code:'',
      subTaxRatioDetail:[],
      subTaxReasonsDetail:[]


    }
  }

  clearSelectedSubTaxRatioItemData() {
    this.selectedSubTaxRatioDetail = {
      id: 0,
      subTaxId: 0,
      fromDate: this.dateService.getCurrentDate(),
      toDate: this.dateService.getCurrentDate(),
      taxRatio: 0

    };
  
  }
  clearSelectedSubTaxReasonItemData() {
    this.selectedSubTaxReasonDetail = {
      id: 0,
      subTaxId: 0,
      taxReasonAr:'',
      taxReasonEn:'',
      code: 0

    };
  
  }


  setInputData() {
    
    this.subTaxDetail.forEach(elment => {
     elment.subTaxRatioDetail=this.subTaxRatioDetail;
     elment.subTaxReasonsDetail = this.subTaxReasonDetail;
    });
   this.taxMaster = new TaxMaster();
    this.taxMaster = {
      id: this.taxForm.controls["id"].value,
      companyId: this.taxForm.controls["companyId"].value,
      branchId: this.taxForm.controls["branchId"].value,
      code: this.taxForm.controls["code"].value,
      nameAr: this.taxForm.controls["nameAr"].value,
      nameEn: this.taxForm.controls["nameEn"].value,
      accountId: this.taxForm.controls["accountId"].value,
      isActive: this.taxForm.controls["isActive"].value,
      subTaxDetail: this.subTaxDetail??[],
      taxDetail:  this.taxDetail??[],

    };


  }
  confirmSave() {
    return new Promise<void>((resolve, reject) => {
      ;
      let sub = this.taxService.createTax(this.taxMaster).subscribe({
        next: (result: any) => {
          this.defineTaxForm();
          this.clearSelectedItemData();
          this.taxDetail = [];
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
  onSave() {
    if (this.taxForm.valid) {
      if (this.taxMaster.taxDetail.length == 0 && this.taxMaster.subTaxDetail.length==0) {
        this.errorMessage = this.translate.instant("tax.tax-details-required");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }
      this.setInputData();
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }
    else {
      this.errorMessage = this.translate.instant("validation-messages.invalid-data");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return this.taxForm.markAllAsTouched();

    }
  }
  confirmUpdate() {
    
    return new Promise<void>((resolve, reject) => {
      let sub = this.taxService.updateTax(this.taxMaster).subscribe({
        next: (result: any) => {
          this.defineTaxForm();
          this.clearSelectedItemData();
          this.taxDetail = [];
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
     
    if (this.taxForm.valid) {
      if (this.taxMaster.taxDetail.length===0 && this.subTaxDetail.length===0) {
        this.errorMessage = this.translate.instant("tax.tax-details-required");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }
      this.setInputData();
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }
    else {
      // this.errorMessage = this.translate.instant("validation-messages.invalid-data");
      // this.errorClass = 'errorMessage';
      // this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return this.taxForm.markAllAsTouched();

    }
  }
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
            this.toolbarPathData.componentAdd = this.translate.instant('tax.add-tax');
            this.defineTaxForm();
            this.clearSelectedItemData();
            this.taxDetail = [];

            this.sharedService.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update && currentBtn.submitMode) {

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

  getSelectedFromDate(selectedDate: DateModel) {
    this.selectedTaxDetail.fromDate = selectedDate;
    this.selectedSubTaxRatioDetail.fromDate = selectedDate;
  }
  getSelectedToDate(selectedDate: DateModel) {
    this.selectedTaxDetail.toDate = selectedDate;
    this.selectedSubTaxRatioDetail.toDate = selectedDate;
  }


 
  dialogOpen: boolean = false;
  openSubTaxRatioDialog(index:number) {
    console.log(this.subTaxDetail);
    ;
    this.subTaxRatioDetail = [];
    if(index != -1)
    {
    let taxRatioDetails = this.subTaxDetail[index].subTaxRatioDetail;
    
    taxRatioDetails.forEach(e=>{
      this.subTaxRatioDetail.push({
       id:e.id,
       fromDate:e.fromDate,
       toDate:e.toDate,
       taxRatio:e.taxRatio,
       subTaxId:e.subTaxId
      });
    });
    }
    
    
    const dialogRef = this.dialog.open(this.dialogSubTaxRatioContent, {
      width: '800px',
      // Add any other dialog configuration options here
    });

    // Subscribe to the afterClosed event to get the result when the dialog is closed
    dialogRef.afterClosed().subscribe(result => {
      // Handle the result or perform any necessary actions
      console.log('Dialog result:', result);
    });
  }

  openSubTaxReasonDialog(index:number) {
    console.log(this.subTaxDetail);
    ;
    this.subTaxReasonDetail = [];
    if(index != -1)
    {
    let taxReasonsDetails = this.subTaxDetail[index].subTaxReasonsDetail;
    
    taxReasonsDetails.forEach(e=>{
      this.subTaxReasonDetail.push({
       id:e.id,
       taxReasonAr:e.taxReasonAr,
       taxReasonEn:e.taxReasonEn,
       subTaxId:e.subTaxId,
       code:e.code
      });
    });
    }
    
    const dialogRef = this.dialog.open(this.dialogSubTaxReasonContent, {
      width: '600px',
      // Add any other dialog configuration options here
    });

    // Subscribe to the afterClosed event to get the result when the dialog is closed
    dialogRef.afterClosed().subscribe(result => {
      // Handle the result or perform any necessary actions
      console.log('Dialog result:', result);
    });
  }


  

}



