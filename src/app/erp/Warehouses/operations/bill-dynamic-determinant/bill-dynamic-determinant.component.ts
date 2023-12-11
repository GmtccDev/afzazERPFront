import { Component, Inject, OnInit } from '@angular/core';
import { ItemCardServiceProxy } from '../../Services/item-card.service';
import { BillDynamicDeterminantDto, BillDynamicDeterminantList, DeterminantsMasterDto, InsertBillDynamicDeterminant, ItemCardDeterminantDto } from '../../models/bill-dynamic-determinant';
import { Subscription } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
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
  billId: any;
  action: any;
  itemCardSerial: any;
  lang = localStorage.getItem("language");
  constructor(private itemCardService: ItemCardServiceProxy, private dialogRef: MatDialogRef<BillDynamicDeterminantComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, private dateService: DateCalculation, public dialog: MatDialog) { }

  ngOnInit(): void {

    // this.date = this.dateService.getCurrentDate();
    this.billItemId = this.data.billItemId;
    this.itemCardId = this.data.itemCardId;
    this.billId = this.data.billItemId;
    this.action = this.data.action;
    this.itemCardSerial = this.data.itemCardSerial;
    this.form = this.fb.group({});

    this.getDynamicDeterminant();
  }
  getDynamicDeterminant() {
    return new Promise<void>((resolve, reject) => {

      let sub = this.itemCardService.getBillDynamicDeterminant(this.billId, this.billItemId, this.itemCardId, this.itemCardSerial).subscribe({
        next: (res) => {
          if (res) {

            this.dynamicDeterminant = res
            this.itemCardDeterminantListDto = res.response.itemCardDeterminantListDto;
            this.dynamicDeterminantListDto = res.response.dynamicDeterminantListDto;
            this.insertBillDynamicDeterminant.itemCardDeterminantListDto = res.response.itemCardDeterminantListDto;
            debugger
            if (this.action == "Edit") {
              for (let i = 0; i < (this.dynamicDeterminantListDto.length/this.itemCardDeterminantListDto.length); i++)
               {    this.addItem();
              }
            }
            else if (this.insertBillDynamicDeterminant.dynamicDeterminantListDto.length == 0) {
              this.addItem();
            }
            if (this.insertBillDynamicDeterminant.dynamicDeterminantListDto) {

              if (this.action == "Edit") {
                for (let i = 0; i < this.insertBillDynamicDeterminant.dynamicDeterminantListDto.length; i++) {

                  var date = this.dynamicDeterminantListDto?.find(c => c.billDynamicDeterminantSerial == i.toString() && c.valueType == 4);
                  this.insertBillDynamicDeterminant.dynamicDeterminantListDto[i].selectedValue = this.dynamicDeterminantListDto?.find(c => c.billDynamicDeterminantSerial == i.toString() && c.valueType == 1)?.value;
                  this.insertBillDynamicDeterminant.dynamicDeterminantListDto[i].numberValue = this.dynamicDeterminantListDto?.find(c => c.billDynamicDeterminantSerial == i.toString() && c.valueType == 2)?.value;
                  this.insertBillDynamicDeterminant.dynamicDeterminantListDto[i].textValue = this.dynamicDeterminantListDto?.find(c => c.billDynamicDeterminantSerial == i.toString() && c.valueType == 3)?.value;
                  this.insertBillDynamicDeterminant.dynamicDeterminantListDto[i].dateValue = this.dateService.getDateForCalender(date?.value)
                  this.insertBillDynamicDeterminant.dynamicDeterminantListDto[i].checkedValue = Boolean(this.dynamicDeterminantListDto?.find(c => c.billDynamicDeterminantSerial == i.toString() && c.valueType == 5)?.value);

                }
              }
              console.log(this.insertBillDynamicDeterminant.dynamicDeterminantListDto)
            }

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
  createObject(item, value, valueType, determinantId) {
    return {
      billId: item.billId,
      billItemId: item.billItemId,
      determinantId: determinantId,
      determinantsMaster: null,
      id: item.id,
      itemCardId: item.itemCardId,
      value: value,
      valueType: valueType,
      billDynamicDeterminantSerial: item.billDynamicDeterminantSerial
    };
  }
  insertBillDynamic() {


    const restructuredData = [];
    this.insertBillDynamicDeterminant.dynamicDeterminantListDto = this.insertBillDynamicDeterminant.dynamicDeterminantListDto.filter(item => {
      return item.numberValue !== null || item.dateValue != null || item.checkedValue != null || item.textValue != null || item.selectedValue != null;
    });

    this.insertBillDynamicDeterminant.dynamicDeterminantListDto.forEach((item) => {

      if (item.checkedValue != null) {
        restructuredData.push(this.createObject(item, item.checkedValue, 5, item.checkedValueId));
        item.checkedValue = null;
      }
      if (item.textValue != null) {
        restructuredData.push(this.createObject(item, item.textValue, 3, item.textValueId));
        item.textValue = null;
      }
      if (item.selectedValue != null) {
        restructuredData.push(this.createObject(item, item.selectedValue, 1, item.selectedValueId));
        item.selectedValue = null;
      }
      if (item.numberValue != null) {
        restructuredData.push(this.createObject(item, item.numberValue, 2, item.numberValueId));
        item.numberValue = null;
      }
      if (item.dateValue != null) {

        var dateValue = this.dateService.getDateForInsert(item.dateValue).toString()
        restructuredData.push(this.createObject(item, dateValue, 4, item.dateValueId));
        item.dateValue = null;
      }
    });


    this.dialogRef.close(restructuredData);


  }
  getDate(selectedDate: DateModel, item) {

    this.date = selectedDate;
    item.dateValue = selectedDate;
  }
  onClose() {
    this.dialog.closeAll();
  }
  addItem() {
    debugger
    let i = this.insertBillDynamicDeterminant.dynamicDeterminantListDto.length + 1;
    this.insertBillDynamicDeterminant.dynamicDeterminantListDto.push({
     
      id: null,
      determinantId: null,

      valueType: null,
      value: '',
      selectedValue: null,
      selectedValueId: this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 1)?.determinantId,

      numberValue: null,
      numberValueId: this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 2)?.determinantId,

      textValue: null,
      textValueId: this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 3)?.determinantId,

      dateValue: null,
      dateValueId: this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 4)?.determinantId,

      checkedValue: false,
      checkedValueId: this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 5)?.determinantId,
    });

  }
  deleteItem(i) {
    this.insertBillDynamicDeterminant.dynamicDeterminantListDto.splice(i);
    // this.insertBillDynamicDeterminant.dynamicDeterminantListDto[i] = null;
  }
}
