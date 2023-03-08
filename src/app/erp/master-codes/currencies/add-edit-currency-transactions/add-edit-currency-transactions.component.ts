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
    this.definecurrencyForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.getCurrencies();
    this.currnetUrl = this.router.url;
    if (this.id != 0) {
      this.getCurrencyTransaction(this.id)
    }
    // this.id = this.currencyMasterId
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
  definecurrencyForm() {
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
    const promise = new Promise<void>((resolve, reject) => {
      this.currencyService.getCurrencyTransaction(id).subscribe({
        next: (res: any) => {

          this.currencyForm.setValue({
            id: res.response?.id,
            transactionDate: this.formatDate(Date.parse(res.response.transactionDate)),
            transactionFactor:res.response.transactionFactor,
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
    });
    return promise;
  }
  getCurrencies() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.currencyService.getDdl().subscribe({
        next: (res) => {

          if (res.success) {
            debugger
            this.currenciesList = res.response.filter( h => h.id !== this.currencyMasterId);;

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
  onInsert() {
    
    var inputDto = new CreateCurrencyTransactionCommand()
    if (this.currencyForm.valid) {
      const promise = new Promise<void>((resolve, reject) => {
        inputDto.inputDto = this.currencyForm.value;
        inputDto.inputDto.currencyMasterId = this.currencyMasterId;
        this.currencyService.createCurrencyTransaction(inputDto).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result dataaddData ', result);
            this.response = { ...result.response };
            this.definecurrencyForm();

            this.submited = false;
            setTimeout(() => {
              this.spinner.hide();
              this.activeModal.close(this.currencyMasterId);
              //  navigateUrl(this.listUrl, this.router);
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

    } else {

      //  return this.currencyForm.markAllAsTouched();
    }
  }


  onUpdate() {
    
    if (this.currencyForm.valid) {
      var inputDto = new EditCurrencyTransactionCommand()
      // this.currencyForm.value.id = this.id;
      console.log("this.VendorCommissionsForm.value", this.currencyForm.value)
      const promise = new Promise<void>((resolve, reject) => {

        inputDto.inputDto = this.currencyForm.value;
        inputDto.inputDto.currencyMasterId = this.currencyMasterId;
        inputDto.inputDto.id = this.id;
        this.currencyService.updateCurrencyTransaction(inputDto).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result update ', result);
            this.response = { ...result.response };
            this.definecurrencyForm();
            this.submited = false;
            setTimeout(() => {
              this.spinner.hide();
              this.activeModal.close(this.currencyMasterId);
             
              // navigateUrl(this.updateUrl, this.router);
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

    else {

      // return this.currencyForm.markAllAsTouched();
    }
  }

  //#endregion
}

