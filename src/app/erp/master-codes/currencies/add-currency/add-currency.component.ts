import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { CurrencyServiceProxy } from '../../services/currency.servies';
import { CurrencyDto } from '../../models/currency';
import { NgxSpinnerService } from 'ngx-spinner';
import { CODE_REQUIRED_VALIDATORS, NAME_REQUIRED_VALIDATORS } from 'src/app/shared/constants/input-validators';
import { Subscription } from 'rxjs';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { navigateUrl } from 'src/app/shared/helper/helper-url';
import * as Tabulator from 'tabulator-tables/dist/js/tabulator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageModalComponent } from 'src/app/shared/components/message-modal/message-modal.component';
import format from 'date-fns/format';
import { AddEditCurrencyTransactionsComponent } from '../add-edit-currency-transactions/add-edit-currency-transactions.component';
@Component({
  selector: 'app-add-currency',
  templateUrl: './add-currency.component.html',
  styleUrls: ['./add-currency.component.scss']
})
export class AddCurrencyComponent implements OnInit {
  //#region Main Declarations
  currenciesForm!: FormGroup;
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  currencies: CurrencyDto[] = [];
  addUrl: string = '/master-codes/currencies/add-currency';
  updateUrl: string = '/master-codes/currencies/update-currency/';
  listUrl: string = '/master-codes/currencies';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("currencies"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  lang = localStorage.getItem("language")
  symbolList: { descriptionAr: string; descriptionEn: string; value: string; }[];
  constructor(
    private currencyService: CurrencyServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService,
    private translate: TranslateService,
    private modelService: NgbModal
  ) {

    this.defineCurrencyForm();
    this.getSymbol();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    this.getRouteData();
    this.changePath();
    this.listenToClickedButton();
    this.currnetUrl = this.router.url;
    if (this.currnetUrl == this.addUrl) {
      this.getCurrencyCode();
    }
    this.spinner.hide();


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
  getRouteData() {
    let sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
          this.getCurrencyById(this.id).then(a => {

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
        this.sharedServices.changeButton({ action: 'New' } as ToolbarData);
        this.spinner.hide();
      }
    });
    this.subsList.push(sub);
  }
  //#region Authentications

  //#endregion

  //#region Permissions

  //#endregion

  //#region  State Management
  //#endregion

  //#region Basic Data
  ///Geting form dropdown list data
  defineCurrencyForm() {
    this.currenciesForm = this.fb.group({
      id: 0,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: NAME_REQUIRED_VALIDATORS,
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      symbol: ''
    });
  }
  getSymbol() {

    this.symbolList = [
      { descriptionAr: 'دولار - $', descriptionEn: 'Dollar - $', value: '1' },
      { descriptionAr: 'يورو - €', descriptionEn: 'Euro - €', value: '2' },
      { descriptionAr: 'ريال – ﷼', descriptionEn: 'Riyal – ﷼', value: '3' },
      { descriptionAr: 'دينار – د.ك', descriptionEn: 'Dinar – د.ك', value: '4' }
    ];
  }
  //#endregion

  //#region CRUD Operations
  getCurrencyById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.currencyService.getCurrency(id).subscribe({
        next: (res: any) => {
          resolve();
          this.currenciesForm.setValue({
            id: res.response.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive,
            symbol: res.response?.symbol
          });
          this.currencyTransactionsDto = res.response?.currencyTransactionsDto;
          this.drawTable();
          console.log(
            'this.currenciesForm.value set value',
            this.currenciesForm.value
          );
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
  getCurrencyCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.currencyService.getLastCode().subscribe({
        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.currencies");
          this.currenciesForm.patchValue({
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
  //#endregion

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.currenciesForm.controls;
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
            this.toolbarPathData.componentAdd = this.translate.instant("currency.add-currency");
            if (this.currenciesForm.value.code != null) {
              this.getCurrencyCode()
            }
            this.defineCurrencyForm();
            this.sharedServices.changeToolbarPath(this.toolbarPathData);
          }else if (currentBtn.action == ToolbarActions.Update) {
            this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
           this.getCurrencyCode();
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
      let sub = this.currencyService.createCurrency(this.currenciesForm.value).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.response = { ...result.response };
          this.defineCurrencyForm();
          this.submited = false;
          this.spinner.hide();
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
  onSave() {
    if (this.currenciesForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.currenciesForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    this.currenciesForm.value.id = this.id;
    return new Promise<void>((resolve, reject) => {
      let sub = this.currencyService.updateCurrency(this.currenciesForm.value).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.response = { ...result.response };
          this.defineCurrencyForm();
          this.submited = false;
          this.spinner.hide();
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
    if (this.currenciesForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }

    else {

      return this.currenciesForm.markAllAsTouched();
    }
  }

  //#endregion
  disabledSave = false;
  disabledUpate = false;
  disabledNew = false;
  disabledDlete = false

  doUpdateEvent(id) {
    const modalRef = this.modelService.open(AddEditCurrencyTransactionsComponent, { size: 'lg' });
    modalRef.componentInstance.name = this.translate.instant('currency.add-edit');
    modalRef.componentInstance.currencyMasterId = this.id;
    modalRef.componentInstance.id = id;
    modalRef.result.then((result) => {
      if (result) {
        this.getCurrencyById(result)
      }
    });
  }

  doNewEvent() {
    const modalRef = this.modelService.open(AddEditCurrencyTransactionsComponent, { size: 'lg' });
    modalRef.componentInstance.name = this.translate.instant('currency.add-edit');
    modalRef.componentInstance.currencyMasterId = this.id;
    modalRef.result.then((result) => {
      if (result) {
        this.getCurrencyById(result)
      }
    });
  }


  showConfirmDeleteMessage(id) {
    const modalRef = this.modelService.open(MessageModalComponent);
    modalRef.componentInstance.message = this.translate.instant('messages.confirm-delete');
    modalRef.componentInstance.title = this.translate.instant('messageTitle.delete');
    modalRef.componentInstance.btnConfirmTxt = this.translate.instant('messageTitle.delete');
    modalRef.componentInstance.isYesNo = true;
    modalRef.result.then((rs) => {
      console.log(rs);
      if (rs == 'Confirm') {
        this.spinner.show();
        let sub = this.currencyService.deleteCurrencyTransaction(id).subscribe(
          () => {
            //reloadPage()
            this.getCurrencyById(this.id);

          });
        this.subsList.push(sub);
        this.spinner.hide();

      }
    });
  }
  editFormatIcon() { //plain text value

    return "<i class='fa fa-edit'></i>";
  };
  deleteFormatIcon() { //plain text value

    return "<i class='fa fa-trash'></i>";
  };
  CheckBoxFormatIcon() { //plain text value

    return "<input id='yourID' type='checkbox' />";
  };
  currencyTransactionsDto: any = [];
  columnNames = [
    this.lang == 'ar'
      ? {
        title: ' العملة ', width: 300, field: 'currencyDetailNameAr'
      } : {
        title: ' Currency ', width: 300, field: 'currencyDetailNameEn'
      },
    this.lang == 'ar'
      ? {
        title: '  تاريخ  ', width: 300, field: 'transactionDate', formatter: function (cell, formatterParams, onRendered) {
          var value = cell.getValue();
          value = format(new Date(value), 'dd-MM-yyyy');;
          return value;
        }
      } : {
        title: '   Date', width: 300, field: 'transactionDate', formatter: function (cell, formatterParams, onRendered) {
          var value = cell.getValue();
          value = format(new Date(value), 'dd-MM-yyyy');;
          return value;
        }
      },
    this.lang == 'ar'
      ? {
        title: ' معامل التحويل  ', width: 300, field: 'transactionFactor'
      } : {
        title: '  Currency Factor ', width: 300, field: 'transactionFactor'
      },
    this.lang == "ar" ? {
      title: "حذف",

      field: "id", formatter: this.deleteFormatIcon, cellClick: (e, cell) => {

        this.showConfirmDeleteMessage(cell.getRow().getData().id);
      },
      //  visible: false,
    } :
      {
        title: "Delete",
        field: "id", formatter: this.deleteFormatIcon, cellClick: (e, cell) => {

          this.showConfirmDeleteMessage(cell.getRow().getData().id);
        },
        //   visible: false,
      }

    ,

    this.lang == "ar" ? {
      title: "تعديل",
      field: "id", formatter: this.editFormatIcon, cellClick: (e, cell) => {

        this.doUpdateEvent(cell.getRow().getData().id);
      }
    }
      :

      {
        title: "Edit",
        field: "id", formatter: this.editFormatIcon, cellClick: (e, cell) => {

          this.doUpdateEvent(cell.getRow().getData().id);
        }
      },



  ];
  exTable: any;
  filterParam: string = '';
  // subscriptionsData=[]
  tab = document.createElement('div');
  drawTable() {
    this.exTable = new Tabulator(this.tab, {
      height: 130,
      layout: 'fitColumns',
      columns: this.columnNames,
      movableColumns: true,
      data: this.currencyTransactionsDto,
      //Local Pagination
      pagination: "local",
      paginationSize: 50,
      paginationSizeSelector: [5, 10, 20, 50, 100, 1000, 10000, 100000],

      paginationCounter: "rows",
    });
    //    this.exTable.setData(persons);
    document.getElementById('ex-table-div').appendChild(this.tab);
  }

}

