import { Component, Inject, OnInit } from '@angular/core';
import { ItemCardServiceProxy } from '../../Services/item-card.service';
import { BillDynamicDeterminantDto, BillDynamicDeterminantList, DeterminantsMasterDto, InsertBillDynamicDeterminant, ItemCardDeterminantDto } from '../../models/bill-dynamic-determinant';
import { Subscription } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateModel } from 'src/app/shared/model/date-model';
import { DateCalculation } from 'src/app/shared/services/date-services/date-calc.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-bill-dynamic-determinant',
  templateUrl: './bill-dynamic-determinant.component.html',
  styleUrls: ['./bill-dynamic-determinant.component.scss']
})
export class BillDynamicDeterminantComponent implements OnInit {
  dynamicDeterminant: BillDynamicDeterminantList;
  subsList: Subscription[] = [];
  billItemId: any;
  itemCardId: any;
  dynamicDeterminantListDto: BillDynamicDeterminantDto[];
  itemCardDeterminantListDto: ItemCardDeterminantDto[];
  insertBillDynamicDeterminant: InsertBillDynamicDeterminant = new InsertBillDynamicDeterminant();
  date!: DateModel;
  form: FormGroup;
  constructor(private itemCardService: ItemCardServiceProxy, private dialogRef: MatDialogRef<BillDynamicDeterminantComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, private dateService: DateCalculation,) { }

  ngOnInit(): void {
    this.date = this.dateService.getCurrentDate();
    this.billItemId = this.data.billItemId;
    this.itemCardId = this.data.itemCardId;
    this.form = this.fb.group({});

    this.getDynamicDeterminant();
  }
  getDynamicDeterminant() {
    return new Promise<void>((resolve, reject) => {

      let sub = this.itemCardService.getBillDynamicDeterminant(undefined, this.billItemId, this.itemCardId).subscribe({
        next: (res) => {
          if (res) {

            this.dynamicDeterminant = res
            this.itemCardDeterminantListDto = res.response.itemCardDeterminantListDto;
            this.dynamicDeterminantListDto = res.response.dynamicDeterminantListDto;
            this.insertBillDynamicDeterminant.itemCardDeterminantListDto = res.response.itemCardDeterminantListDto;
          
               if (this.insertBillDynamicDeterminant.dynamicDeterminantListDto) {
                for (let i = 0; i < 10; i++) {
                 // this.insertBillDynamicDeterminant.itemCardDeterminantListDto.forEach(element => {
                    this.insertBillDynamicDeterminant.dynamicDeterminantListDto.push({
                      id: null,
                      billId: null,
                      billItemId: this.billItemId,
                      itemCardId: this.itemCardId,
                      determinantId: null,
                      determinantsMaster: null,
                    
                     
                      valueType: null,
                      value: '',
                   
         
                      selectedValue : null,
                      selectedValueId : this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c=>c.determinantsMaster.valueType==1)?.determinantId,
         
                      numberValue : null,
                      numberValueId : this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c=>c.determinantsMaster.valueType==2)?.determinantId,
         
                      textValue : null,
                      textValueId : this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c=>c.determinantsMaster.valueType==3)?.determinantId,
         
                      dateValue : null,
                      dateValueId : this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c=>c.determinantsMaster.valueType==4)?.determinantId,
         
                      checkedValue : null,
                      checkedValueId : this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c=>c.determinantsMaster.valueType==5)?.determinantId,
                    });
            //  });
                  }}      
            console.log(this.insertBillDynamicDeterminant)



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
  createObject(item, value, valueType,determinantId) {
    return {
      billId: item.billId,
      billItemId: item.billItemId,
      determinantId: determinantId,
      determinantsMaster: null,
      id: item.id,
      itemCardId: item.itemCardId,
      value: value,
      valueType: valueType
    };
  }
  insertBillDynamic() {


    const restructuredData = [];
    this.insertBillDynamicDeterminant.dynamicDeterminantListDto = this.insertBillDynamicDeterminant.dynamicDeterminantListDto.filter(item => {
      return item.numberValue!==null||item.dateValue != null||item.checkedValue!=null||item.textValue!=null||item.selectedValue != null;
    });
    debugger
    this.insertBillDynamicDeterminant.dynamicDeterminantListDto.forEach((item) => {
      debugger
      if (item.checkedValue != null) {
        restructuredData.push(this.createObject(item, item.checkedValue, 5,item.checkedValueId));
        item.checkedValue = null;
      }
      if (item.textValue != null) {
        restructuredData.push(this.createObject(item, item.textValue, 3,item.textValueId));
        item.textValue = null;
      }
      if (item.selectedValue != null) {
        restructuredData.push(this.createObject(item, item.selectedValue, 1,item.selectedValueId));
        item.selectedValue = null;
      }
      if (item.numberValue != null) {
        restructuredData.push(this.createObject(item, item.numberValue, 2,item.numberValueId));
        item.numberValue = null;
      }
      if (item.dateValue != null) {
        restructuredData.push(this.createObject(item, item.dateValue, 4,item.dateValueId));
        item.dateValue = null;
      }
    });
    this.insertBillDynamicDeterminant.dynamicDeterminantListDto=restructuredData;
    let enity = this.insertBillDynamicDeterminant;
    return new Promise<void>((resolve, reject) => {
      debugger
      let sub = this.itemCardService.insertBillDynamicDeterminant(enity).subscribe({
        next: (res) => {
          if (res) {
            
            this.dynamicDeterminant = res

          }
          resolve();

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
        },
      });

      this.subsList.push(sub);})
  }
  getDate(selectedDate: DateModel) {
    debugger
    this.date = selectedDate;
  }
  addNewObject(item) {

  }
}
