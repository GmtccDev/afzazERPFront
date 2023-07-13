import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions';
import { ToolbarData } from '../../../../shared/interfaces/toolbar-data';
import { ToolbarPath } from '../../../../shared/interfaces/toolbar-path';
import { SharedService } from '../../../../shared/common-services/shared-service';
import { formatDate } from '../../../../shared/helper/helper-url';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { DateModel } from 'src/app/shared/model/date-model';
import { DateCalculation } from 'src/app/shared/services/date-services/date-calc.service';
import { REQUIRED_VALIDATORS } from 'src/app/shared/constants/input-validators';
import { PublicService } from 'src/app/shared/services/public.service';
import { NotificationsAlertsService } from 'src/app/shared/common-services/notifications-alerts.service';
import { FiscalPeriodServiceProxy } from '../../services/fiscal-period.services';
import { GeneralConfigurationServiceProxy } from '../../services/general-configurations.services';


@Component({
  selector: 'app-close-fiscal-period',
  templateUrl: './close-fiscal-period.component.html',
  styleUrls: ['./close-fiscal-period.component.scss']
})
export class CloseFiscalPeriodComponent implements OnInit {
  //#region Main Declarations
  closeFiscalPeriodForm!: FormGroup;
  response:any;
  closeDate: any;
  fromDate:any;
  toDate:any;
  closeAccountId:any;
  lang = localStorage.getItem("language")
  companyId = localStorage.getItem("companyId")
  branchId = localStorage.getItem("branchId")

  addUrl: string = '';
  updateUrl: string = '';
  listUrl: string = '/accounting-operations/closeFiscalPeriod';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.close-fiscal-period"),
    componentAdd: '',

  };
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  fiscalPeriodId: number;
  fiscalPeriodList: any;
  routeApi = 'Account/get-ddl?'
  routeApiPeriod = 'FiscalPeriod/get-ddl?'


  constructor(
    private publicService: PublicService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,
    private dateService: DateCalculation,
    private spinnerService: NgxSpinnerService,
    private alertsService: NotificationsAlertsService,
    private fiscalPeriodService: FiscalPeriodServiceProxy,
    private generalConfigurationService: GeneralConfigurationServiceProxy,




  ) {
    this.defineCloseFiscalPeriodForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.listenToClickedButton();

    this.getFiscalPeriods();
    this.getGeneralConfigurationsOfCloseAccount();
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
  defineCloseFiscalPeriodForm() {
    this.closeFiscalPeriodForm = this.fb.group({
      // id: 0,
      closeDate: [this.dateService.getCurrentDate(), Validators.compose([Validators.required])],
      fiscalPeriodId: REQUIRED_VALIDATORS
   


    });
    this.closeDate = this.dateService.getCurrentDate();

  }
  getFiscalPeriods() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeApiPeriod).subscribe({
        next: (res) => {

          if (res.success) {
            this.fiscalPeriodList = res.response.filter(x=>x.fiscalPeriodStatus==1);

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

  //#region CRUD Operations
 
 
 
  //#endregion

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.closeFiscalPeriodForm.controls;
  }
  getCloseDate(selectedDate: DateModel) {
    this.closeDate = selectedDate;
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
            this.toolbarPathData.componentAdd = this.translate.instant("component-names.close-fiscal-period");
           // this.defineVoucherTypeForm();
            this.sharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update) {
            //this.onUpdate();
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
    debugger
    if (this.closeFiscalPeriodForm.valid) {
     // this.getFiscalPeriodById(this.closeFiscalPeriodForm.value.fiscalPeriodId)
      this.spinnerService.show();
     this.closeFiscalPeriodForm.value.closeDate = this.dateService.getDateForInsert(this.closeFiscalPeriodForm.controls["closeDate"].value);
      const promise = new Promise<void>((resolve, reject) => {
        debugger
        this.closeDate=formatDate(Date.parse(this.closeFiscalPeriodForm.value.closeDate))
        this.fiscalPeriodService.closeFiscalPeriod(this.companyId,this.branchId,this.fiscalPeriodId,this.closeDate,this.fromDate,this.toDate,this.closeAccountId).subscribe({
          next: (result: any) => {
            debugger
            console.log('result dataaddData ', result);
            this.response = { ...result.response };
           this.defineCloseFiscalPeriodForm();
            this.getFiscalPeriods();
            this.submited = false;
            setTimeout(() => {
              this.spinner.hide();

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
    else
    {
    this.errorMessage = this.translate.instant("validation-messages.invalid-data");
    this.errorClass = 'errorMessage';
    this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
    return this.closeFiscalPeriodForm.markAllAsTouched();
    }
  }
  getFiscalPeriodById(id: any) {
    const promise = new Promise<void>((resolve, reject) => {
      this.fiscalPeriodService.getFiscalPeriod(id).subscribe({
        next: (res: any) => {
          debugger
          console.log('result data getbyid', res);
          this.fromDate= formatDate(Date.parse(res.response.fromDate));
          this.toDate= formatDate(Date.parse(res.response.toDate));
       
          
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
  getGeneralConfigurationsOfCloseAccount() {
    debugger
    const promise = new Promise<void>((resolve, reject) => {
      debugger
      this.generalConfigurationService.getGeneralConfiguration(5).subscribe({
        next: (res: any) => {
          debugger
          console.log('result data getbyid', res);

          if (res.response.value >0) {
            this.closeAccountId = res.response.value ;
          }


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

