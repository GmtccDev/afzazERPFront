import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NotificationsAlertsService } from '../../../../shared/common-services/notifications-alerts.service';
import { SharedService } from '../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../shared/interfaces/toolbar-path';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ToolbarData } from '../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../shared/helper/helper-url';
import { GeneralConfigurationServiceProxy } from '../../services/general-configurations.services'
import { EditGeneralConfigurationCommand, GeneralConfigurationDto } from '../../models/general-configurations';
import { CurrencyDto } from '../../../master-codes/models/currency';
import { CurrencyServiceProxy } from '../../../master-codes/services/currency.servies';
@Component({
  selector: 'app-accounting-configurations',
  templateUrl: './accounting-configurations.component.html',
  styleUrls: ['./accounting-configurations.component.scss']
})
export class AccountingConfigurationsComponent implements OnInit {
  //#region Main Declarations
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  currencyList: CurrencyDto[] = [];
  generalConfiguration: GeneralConfigurationDto[] = [];
  addUrl: string = '/configurations/accounting-configurations';
  updateUrl: string = '/configurations/gaccounting-configurations';
  listUrl: string = '/configurations/accounting-configurations';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.generalConfiguration"),
    componentAdd: '',

  };
  Response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  serialList: { nameAr: string; nameEn: string; value: string; }[];
  cycleList: { nameAr: string; nameEn: string; value: string; }[];
  constructor(private currencyService: CurrencyServiceProxy,
    private generalConfigurationService: GeneralConfigurationServiceProxy,
    private router: Router,
    private sharedServices: SharedService,
    private alertsService: NotificationsAlertsService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private SharedServices: SharedService, private translate: TranslateService
  ) {
    
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.sharedServices.changeButton({
      action: 'Update',
      componentName: 'List',
      submitMode: false
    } as ToolbarData);

    // this.toolbarPathData.updatePath = "/control-panel/definitions/update-benefit-person/"
    this.sharedServices.changeToolbarPath(this.toolbarPathData);
    this.getSerial();
    this.getCycle();
    this.getCurrencies()
    this.currnetUrl = this.router.url;
    this.listenToClickedButton();
 //   this.changePath();
    this.getGeneralConfiguration();
    this.cycleSelected = this.lang == "ar" ? "رقم" : "Number";
    this.getSelecteditem();
  }

  getSelecteditem() {
    this.radioSel = this.cycleList.find(Item => Item.value === this.cycleSelected);
    this.radioSelectedString = JSON.stringify(this.radioSel);
  }
  onItemChange(item) {
    this.getSelecteditem();
  }
  radioSel: any;
  cycleSelected: string;
  currencyId:any;
  multiCurrency:any;
  serial:any;
  radioSelectedString: string;
  lang = localStorage.getItem("language");
  getSerial() {
    this.serialList = [
      { nameAr: 'رقم ', nameEn: 'Number', value: '1' },
      { nameAr: 'اليومية / رقم', nameEn: 'Daily/Number', value: '2' },
      { nameAr: "  اليومية / الفترة المحاسبي / رقم   ", nameEn: 'Daily/Period Accounting/Number', value: '3' }
    ];
  }
  getCycle() {
    this.cycleList = [
      { nameAr: 'مسودة – تمت مراجعته – مرحل ', nameEn: 'Draft - revised - carried over', value: '1' },
      { nameAr: ' مسودة – مرحل', nameEn: 'Draft  - carried over', value: '2' },
      { nameAr: "  مرحل  ", nameEn: 'carried over', value: '3' }
    ];
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
  getCurrencies() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.currencyService.getDdl().subscribe({
        next: (res) => {

          if (res.success) {
            this.currencyList = res.response;

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

  //#region Authentications

  //#endregion

  //#region Permissions

  //#endregion

  //#region  State Management
  //#endregion

  //#region Basic Data
  ///Geting form dropdown list data


  //#endregion

  //#region CRUD Operations
  getGeneralConfiguration() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.allGeneralConfiguration(1,undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {

          console.log(res);
          //let data =
          //   res.data.map((res: PeopleOfBenefitsVM[]) => {
          //   return res;
          // });
          this.toolbarPathData.componentList = this.translate.instant("component-names.companies");
          if (res.success) {
            debugger
            this.generalConfiguration = res.response.items
             this.currencyId=Number(this.generalConfiguration.find(c=>c.id==1).value) ;
             this.multiCurrency=Boolean(this.generalConfiguration.find(c=>c.id==2).value);
             this.serial=this.generalConfiguration.find(c=>c.id==3).value;
             this.cycleSelected=this.generalConfiguration.find(c=>c.id==4).value;
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

 

  //#endregion
  //#region Tabulator
  subsList: Subscription[] = [];
  currentBtnResult;
  listenToClickedButton() {
    let sub = this.SharedServices.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {
        currentBtn;

        if (currentBtn != null) {
          if (currentBtn.action == ToolbarActions.List) {
            this.SharedServices.changeToolbarPath({
              listPath: this.listUrl,
            } as ToolbarPath);
            this.router.navigate([this.listUrl]);
          } else if (currentBtn.action == ToolbarActions.Save) {
           ;
          } else if (currentBtn.action == ToolbarActions.New) {
            this.toolbarPathData.componentAdd = 'Add GeneralConfiguration';
            
            this.SharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update) {
            this.onUpdate();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.SharedServices.changeToolbarPath(this.toolbarPathData);
  }


  onUpdate() {

   {

    debugger
    if( this.generalConfiguration.length>0){
      this.generalConfiguration.forEach((s) => {
        if (s) {
        if(s.id==1){
          s.value=this.currencyId+"";
        }
        else  if(s.id==2){
          s.value=this.multiCurrency+"";
        }
        else  if(s.id==3){
          s.value=this.serial+"";
        }
        else  if(s.id==4){
          s.value=this.cycleSelected+"";
        }
        }
      });
              
        const promise = new Promise<void>((resolve, reject) => {
          debugger
          let item=new EditGeneralConfigurationCommand();
          item.generalConfiguration=this.generalConfiguration;
          this.generalConfigurationService.updateGeneralConfiguration(item).subscribe({
            next: (result: any) => {
              this.spinner.show();
              console.log('result update ', result);
              this.Response = { ...result.response };
              
              this.submited = false;
              setTimeout(() => {
                this.spinner.hide();
  
                navigateUrl(this.listUrl, this.router);
              }, 1000);
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
  
    }
   
   
  }

  //#endregion
}

