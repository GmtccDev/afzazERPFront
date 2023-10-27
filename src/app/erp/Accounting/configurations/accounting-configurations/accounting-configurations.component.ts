import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
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
import { PublicService } from 'src/app/shared/services/public.service';
import { JournalDto } from '../../models/journal';
import { GeneralConfigurationEnum } from 'src/app/shared/constants/enumrators/enums';
@Component({
  selector: 'app-accounting-configurations',
  templateUrl: './accounting-configurations.component.html',
  styleUrls: ['./accounting-configurations.component.scss']
})
export class AccountingConfigurationsComponent implements OnInit, OnDestroy {
  //#region Main Declarations
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  journalId: any = '';
  radioSel: any;
  radioSelectedString: string;
  cycleSelected: any = '1';
  currencyId: any = '';
  multiCurrency: any = '';
  accountReceivablesId: any = '';
  serial: any = '1';
  accountId: any = '';
  chequesJournalId: any = '';
  accountExchangeId: any = '';
  accountingPeriodId: any = '';
  idleTime: any = '';

  lang = localStorage.getItem("language");
  currencyList: CurrencyDto[] = [];
  generalConfiguration: GeneralConfigurationDto[] = [];
  addUrl: string = '/configurations/accounting-configurations';
  updateUrl: string = '/configurations/gaccounting-configurations';
  listUrl: string = '/configurations/accounting-configurations';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.general-configuration"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  serialList: { nameAr: string; nameEn: string; value: string; }[];
  virtualJournalEntriesList: { nameAr: string; nameEn: string; value: string; }[];
  cycleList: { nameAr: string; nameEn: string; value: string; }[];
  routeAccountApi = 'Account/GetLeafAccounts?'
  routeApiPeriod = 'FiscalPeriod/get-ddl?'
  accountList: any;
  showSearchModal: boolean;
  showSearchModalAccountReceivables: boolean;
  ListPeriod: any;
  showSearchModalAccountExchange: boolean;
  constructor(private currencyService: CurrencyServiceProxy,
    private generalConfigurationService: GeneralConfigurationServiceProxy,
    private router: Router,
    private publicService: PublicService,
    private spinner: NgxSpinnerService,
    private sharedService: SharedService, private translate: TranslateService
  ) {

  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

    this.getSerial();
    this.getCycle();
    this.changePath();
    this.spinner.show();
    Promise.all([

      this.getCurrencies(),
      this.getCurrencies(),
      this.getAccount(),
      this.getJournals(),
      this.getAccountPeriod(),
      ,])
      .then(a => {
        this.spinner.hide();
        this.listenToClickedButton();
        this.getGeneralConfiguration()
        // this.cycleSelected = this.lang == "ar" ? "رقم" : "Number";

        this.sharedService.changeButton({ action: "ConfigMode" } as ToolbarData);
        this.getSelecteditem();
      }).catch(err => {
        this.spinner.hide();
      })


  }


  getSelecteditem() {
    this.radioSel = this.cycleList.find(Item => Item.value === this.cycleSelected);
    this.radioSelectedString = JSON.stringify(this.radioSel);
  }
  onItemChange(item) {
    this.getSelecteditem();
  }

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

        },
      });

      this.subsList.push(sub);
    });

  }
  routeJournalApi = 'Journal/get-ddl?'
  journalList: JournalDto[] = [];
  d
  getJournals() {
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

        },
      });

      this.subsList.push(sub);
    });

  }
  getAccount() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountApi).subscribe({
        next: (res) => {

          ;
          if (res.success) {
            this.accountList = res.response;

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
  getAccountPeriod() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeApiPeriod).subscribe({
        next: (res) => {

          if (res.success) {
            this.ListPeriod = res.response;
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
      let sub = this.generalConfigurationService.allGeneralConfiguration(undefined, 1, 10000, undefined, undefined, undefined).subscribe({
        next: (res) => {
          resolve();

          this.toolbarPathData.componentList = this.translate.instant("component-names.general-configuration");
          if (res.success) {
            debugger
            this.generalConfiguration = res.response.result.items
            if (Number(this.generalConfiguration.find(c => c.id == GeneralConfigurationEnum.MainCurrency).value) > 0) {
              this.currencyId = Number(this.generalConfiguration.find(c => c.id == GeneralConfigurationEnum.MainCurrency).value);
            }
            else {
              this.currencyId = "";
            }

            this.multiCurrency = this.generalConfiguration.find(c => c.id == GeneralConfigurationEnum.MultiCurrency).value == "true" ? true : false;
            debugger
            this.serial = this.generalConfiguration.find(c => c.id == GeneralConfigurationEnum.JournalEntriesSerial).value;
           
            this.cycleSelected = this.generalConfiguration.find(c => c.id == GeneralConfigurationEnum.FinancialEntryCycle).value;
            this.accountId = this.generalConfiguration.find(c => c.id == GeneralConfigurationEnum.ClosingAccount).value;
            this.accountReceivablesId = this.generalConfiguration.find(c => c.id == GeneralConfigurationEnum.AccountReceivables).value;
            if (Number(this.generalConfiguration.find(c => c.id == GeneralConfigurationEnum.AccountingPeriod).value) > 0) {
              this.accountingPeriodId = Number(this.generalConfiguration.find(c => c.id == GeneralConfigurationEnum.AccountingPeriod).value);
            }
            else {
              this.accountingPeriodId = "";
            }
            this.accountExchangeId = this.generalConfiguration.find(c => c.id == GeneralConfigurationEnum.AccountExchange).value;
            if (Number(this.generalConfiguration.find(c => c.id == GeneralConfigurationEnum.DefaultJournal).value) > 0) {
              this.journalId = Number(this.generalConfiguration.find(c => c.id == GeneralConfigurationEnum.DefaultJournal).value);
            }
            else {
              this.journalId = "";
            }
            if (Number(this.generalConfiguration.find(c => c.id == GeneralConfigurationEnum.ChequesJournal).value) > 0) {
              this.chequesJournalId = Number(this.generalConfiguration.find(c => c.id == GeneralConfigurationEnum.ChequesJournal).value);

            }
            else {
              this.chequesJournalId = "";
            }
            this.idleTime = this.generalConfiguration.find(c => c.id == GeneralConfigurationEnum.IdleTime).value;


          }



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

  //#region Helper Functions



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
            currentBtn.action = this.updateUrl
          } else if (currentBtn.action == ToolbarActions.Save) {
            currentBtn.action = this.updateUrl
          } else if (currentBtn.action == ToolbarActions.New) {
            currentBtn.action = this.updateUrl

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
  confirmUpdate() {
    return new Promise<void>((resolve, reject) => {

      let item = new EditGeneralConfigurationCommand();
      item.generalConfiguration = this.generalConfiguration;
      let sub = this.generalConfigurationService.updateGeneralConfiguration(item).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.response = { ...result.response };
          this.sharedService.changeButton({ action: "ConfigMode" } as ToolbarData);
          this.spinner.hide();

          navigateUrl(this.listUrl, this.router);
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {

        },
      });
      this.subsList.push(sub);

    }).then(a => {
      this.getGeneralConfiguration();
    });
  }

  onUpdate() {
    {

      if (this.generalConfiguration.length > 0) {
        this.generalConfiguration.forEach((s) => {
          if (s) {
            if (s.id == 1) {
              if (this.currencyId > 0) {
                s.value = this.currencyId + "";
              }
              else {
                s.value = "";
              }
            }
            else if (s.id == 2) {
              s.value = this.multiCurrency + "";
            }
            else if (s.id == 3) {
              if (this.serial > 0) {
                s.value = this.serial + "";
              }
              else {
                s.value = "1";
              }
            }
            else if (s.id == 4) {
              if(this.cycleSelected>0)
              {
                s.value = this.cycleSelected + "";

              }
              else
              {
                s.value = "1";

              }
            }
            else if (s.id == 5) {
              if (this.accountId > 0) {
                s.value = this.accountId + "";
              }
              else {
                s.value = "";
              }
            }
            else if (s.id == 6) {
              if (this.accountReceivablesId > 0) {
                s.value = this.accountReceivablesId + "";
              }
              else {
                s.value = "";

              }
            }
            else if (s.id == 7) {
              if (this.accountingPeriodId > 0) {
                s.value = this.accountingPeriodId + "";
              }
              else {
                s.value = "";

              }
            }
            else if (s.id == 8) {
              if (this.accountExchangeId > 0) {
                s.value = this.accountExchangeId + "";
              }
              else {
                s.value = "";

              }
            }
            else if (s.id == 1006) {
              if (this.journalId > 0) {
                s.value = this.journalId + "";
              }
              else {
                s.value = "";

              }
            }
            else if (s.id == 1007) {
              if (this.chequesJournalId > 0) {
                s.value = this.chequesJournalId + "";
              }
              else {
                s.value = "";

              }
            }
            else if (s.id == 10001) {
              s.value = this.idleTime + "";
            }
          }
        });

        this.spinner.show();
        this.confirmUpdate().then(a => {
          this.spinner.hide();
          this.getGeneralConfiguration();
          this.changePath();
        }).catch(e => {
          this.spinner.hide();
        });
      }

    }


  }
  onSelectAccount(event) {

    this.accountId = event.id;
    this.showSearchModal = false;
  }
  onSelectAccountReceivables(event) {

    this.accountReceivablesId = event.id;
    this.showSearchModalAccountReceivables = false;
  }
  onSelectAccountExchange(event) {

    this.accountExchangeId = event.id;
    this.showSearchModalAccountExchange = false;
  }
  //#endregion
}

