import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

import { CreateCurrencyTransactionCommand, EditCurrencyTransactionCommand } from '../../models/currency';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyServiceProxy } from '../../services/currency.servies';
@Component({
  selector: 'app-add-edit-currency-transactions',
  templateUrl: './add-edit-currency-transactions.component.html',
  styleUrls: ['./add-edit-currency-transactions.component.scss']
})
export class AddEditCurrencyTransactionsComponent implements OnInit {
  //#region Main Declarations
  currencyForm!: FormGroup;
  sub: any;
  url: any;
  // id: any = 0;
  currnetUrl;
  public show: boolean = false;
  lang = localStorage.getItem("language")
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  @Input() public currencyMasterId;
  @Input() public id: any = 0;
  currenciesList: any;
  constructor(
    private currencyService: CurrencyServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public activeModal: NgbActiveModal
  ) {
    this.defineCurrencyForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    Promise.all([
      this.getCurrencies()
    ]).then(a => {
      if (this.id != 0) {
        this.getCurrencyTransaction(this.id)
      }
      this.spinner.hide();

    }).catch(err => {

      this.spinner.hide();
    });

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


  //#region Basic Data
  ///Geting form dropdown list data
  defineCurrencyForm() {
    this.currencyForm = this.fb.group({
      id: 0,
      transactionDate: null,
      transactionFactor: null,
      currencyMasterId: this.currencyMasterId,
      currencyDetailId: null,
    });
  }

  //#endregion
  private formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }
  //#region CRUD Operations
  getCurrencyTransaction(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.currencyService.getCurrencyTransaction(id).subscribe({
        next: (res: any) => {
          resolve();
          this.currencyForm.setValue({
            id: res.response?.id,
            transactionDate: this.formatDate(Date.parse(res.response.transactionDate)),
            transactionFactor: res.response.transactionFactor,
            currencyMasterId: this.currencyMasterId,
            currencyDetailId: res.response?.currencyDetailId,

          });


          console.log(
            'this.currencyForm.value set value',
            this.currencyForm.value
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
  getCurrencies() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.currencyService.getDdl().subscribe({
        next: (res) => {

          if (res.success) {

            this.currenciesList = res.response.filter(h => h.id !== this.currencyMasterId);;

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
    return this.currencyForm.controls;
  }


  //#endregion
  //#region Tabulator
  subsList: Subscription[] = [];
  currentBtnResult;
  save() {
    if (this.currencyForm.value.id == 0) {
      this.onInsert();
    }
    else {
      this.onUpdate();
    }
  }
  confirmSave() {
    var inputDto = new CreateCurrencyTransactionCommand()
    return new Promise<void>((resolve, reject) => {
      inputDto.inputDto = this.currencyForm.value;
      inputDto.inputDto.currencyMasterId = this.currencyMasterId;
      let sub = this.currencyService.createCurrencyTransaction(inputDto).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.response = { ...result.response };
          this.defineCurrencyForm();

          this.submited = false;
          this.spinner.hide();
          this.activeModal.close(this.currencyMasterId);
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
  onInsert() {
    if (this.currencyForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    } else {

      return this.currencyForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    var inputDto = new EditCurrencyTransactionCommand()
    return new Promise<void>((resolve, reject) => {

      inputDto.inputDto = this.currencyForm.value;
      inputDto.inputDto.currencyMasterId = this.currencyMasterId;
      inputDto.inputDto.id = this.id;
      let sub = this.currencyService.updateCurrencyTransaction(inputDto).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.response = { ...result.response };
          this.defineCurrencyForm();
          this.submited = false;
          this.spinner.hide();
          this.activeModal.close(this.currencyMasterId);


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
    if (this.currencyForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }
    else {

      return this.currencyForm.markAllAsTouched();
    }
  }

  //#endregion
}

