import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WarehousesUnitServiceProxy } from '../../../Services/warehousesunit.servies';
import { CreateWarehousesUnitTransactionCommand, EditWarehousesUnitTransactionCommand } from '../../../models/warehouses-unit';
@Component({
  selector: 'app-add-edit-warehouses-unit-transactions',
  templateUrl: './add-edit-warehouses-unit-transactions.component.html',
  styleUrls: ['./add-edit-warehouses-unit-transactions.component.scss']
})
export class AddEditWarehousesUnitTransactionsComponent implements OnInit {
  //#region Main Declarations
  warehousesUnitTransactionsForm!: FormGroup;

  currnetUrl;
  public show: boolean = false;
  lang = localStorage.getItem("language")
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  @Input() public warehousesUnitMasterId;
  @Input() public id: any = 0;
  warehousesUnitsList: any;
  constructor(
    private warehousesUnitService: WarehousesUnitServiceProxy,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public activeModal: NgbActiveModal
  ) {
    this.defineWarehousesUnitTransactionsForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    Promise.all([
      this.getWarehousesUnits()
    ]).then(a => {
      if (this.id != 0) {
        this.getWarehousesUnitTransaction(this.id)
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
  defineWarehousesUnitTransactionsForm() {
    this.warehousesUnitTransactionsForm = this.fb.group({
      id: 0,
      transactionFactor: null,
      warehousesUnitMasterId: this.warehousesUnitMasterId,
      warehousesUnitDetailId: null,
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
  getWarehousesUnitTransaction(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.warehousesUnitService.getWarehousesUnitTransaction(id).subscribe({
        next: (res: any) => {
          resolve();
          this.warehousesUnitTransactionsForm.setValue({
            id: res.response?.id,
            transactionFactor: res.response.transactionFactor,
            warehousesUnitMasterId: this.warehousesUnitMasterId,
            warehousesUnitDetailId: res.response?.warehousesUnitDetailId,

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
  getWarehousesUnits() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.warehousesUnitService.getDdl().subscribe({
        next: (res) => {

          if (res.success) {

            this.warehousesUnitsList = res.response.filter(h => h.id !== this.warehousesUnitMasterId);;

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
    return this.warehousesUnitTransactionsForm.controls;
  }


  //#endregion
  //#region Tabulator
  subsList: Subscription[] = [];
  currentBtnResult;
  save() {
    if (this.warehousesUnitTransactionsForm.value.id == 0) {
      this.onInsert();
    }
    else {
      this.onUpdate();
    }
  }
  confirmSave() {
    var inputDto = new CreateWarehousesUnitTransactionCommand()
    return new Promise<void>((resolve, reject) => {
      inputDto.inputDto = this.warehousesUnitTransactionsForm.value;
      inputDto.inputDto.warehousesUnitMasterId = this.warehousesUnitMasterId;
      let sub = this.warehousesUnitService.createWarehousesUnitTransaction(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.defineWarehousesUnitTransactionsForm();
          this.submited = false;
          this.activeModal.close(this.warehousesUnitMasterId);
          this.spinner.hide();
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
    if (this.warehousesUnitTransactionsForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    } else {

      return this.warehousesUnitTransactionsForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    debugger
    var inputDto = new EditWarehousesUnitTransactionCommand()
    return new Promise<void>((resolve, reject) => {

      inputDto.inputDto = this.warehousesUnitTransactionsForm.value;
      inputDto.inputDto.warehousesUnitMasterId = this.warehousesUnitMasterId;
      inputDto.inputDto.id = this.id;
      let sub = this.warehousesUnitService.updateWarehousesUnitTransaction(inputDto).subscribe({
        next: (result: any) => {
          debugger
          this.response = { ...result.response };
          this.defineWarehousesUnitTransactionsForm();
          this.submited = false;
          this.activeModal.close(this.warehousesUnitMasterId);
          this.spinner.hide();

          debugger

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
    if (this.warehousesUnitTransactionsForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        debugger
        this.spinner.hide();
      }).catch(e => {
        debugger
        this.spinner.hide();
      });
    }
    else {

      return this.warehousesUnitTransactionsForm.markAllAsTouched();
    }
  }

  //#endregion
}

