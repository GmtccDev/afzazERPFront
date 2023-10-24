import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UnitServiceProxy } from '../../../Services/unit.servies';
import { CreateUnitTransaction, EditUnitTransaction } from '../../../models/unit';
@Component({
  selector: 'app-add-edit-unit-transaction',
  templateUrl: './add-edit-unit-transaction.component.html',
  styleUrls: ['./add-edit-unit-transaction.component.scss']
})
export class AddEditUnitTransactionComponent implements OnInit {
  //#region Main Declarations
  unitTransactionForm!: FormGroup;

  currnetUrl;
  public show: boolean = false;
  lang = localStorage.getItem("language")
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  @Input() public unitMasterId;
  @Input() public id: any = 0;
  unitsList: any;
  constructor(
    private unitService: UnitServiceProxy,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public activeModal: NgbActiveModal
  ) {
    this.defineUnitTransactionForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    Promise.all([
      this.getUnits()
    ]).then(a => {
      if (this.id != 0) {
        this.getUnitTransaction(this.id)
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
  defineUnitTransactionForm() {
    this.unitTransactionForm = this.fb.group({
      id: 0,
      transactionFactor: null,
      unitMasterId: this.unitMasterId,
      unitDetailId: null,
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
  getUnitTransaction(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.unitService.getUnitTransaction(id).subscribe({
        next: (res: any) => {
          resolve();
          this.unitTransactionForm.setValue({
            id: res.response?.id,
            transactionFactor: res.response.transactionFactor,
            unitMasterId: this.unitMasterId,
            unitDetailId: res.response?.unitDetailId,

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
  getUnits() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.unitService.getDdl().subscribe({
        next: (res) => {

          if (res.success) {

            this.unitsList = res.response.filter(h => h.id !== this.unitMasterId);;

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

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.unitTransactionForm.controls;
  }


  //#endregion
  //#region Tabulator
  subsList: Subscription[] = [];
  currentBtnResult;
  save() {
    if (this.unitTransactionForm.value.id == 0) {
      this.onInsert();
    }
    else {
      this.onUpdate();
    }
  }
  confirmSave() {
    var inputDto = new CreateUnitTransaction()
    return new Promise<void>((resolve, reject) => {
      inputDto.inputDto = this.unitTransactionForm.value;
      inputDto.inputDto.unitMasterId = this.unitMasterId;
      let sub = this.unitService.createUnitTransaction(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.defineUnitTransactionForm();
          this.submited = false;
          this.activeModal.close(this.unitMasterId);
          this.spinner.hide();
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
  onInsert() {
    if (this.unitTransactionForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    } else {

      return this.unitTransactionForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    
    var inputDto = new EditUnitTransaction()
    return new Promise<void>((resolve, reject) => {

      inputDto.inputDto = this.unitTransactionForm.value;
      inputDto.inputDto.unitMasterId = this.unitMasterId;
      inputDto.inputDto.id = this.id;
      let sub = this.unitService.updateUnitTransaction(inputDto).subscribe({
        next: (result: any) => {
          
          this.response = { ...result.response };
          this.defineUnitTransactionForm();
          this.submited = false;
          this.activeModal.close(this.unitMasterId);
          this.spinner.hide();

          

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
    if (this.unitTransactionForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        
        this.spinner.hide();
      }).catch(e => {
        
        this.spinner.hide();
      });
    }
    else {

      return this.unitTransactionForm.markAllAsTouched();
    }
  }

  //#endregion
}

