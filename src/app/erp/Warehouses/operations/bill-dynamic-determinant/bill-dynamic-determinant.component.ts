import { Component, Inject, OnInit } from '@angular/core';
import { ItemCardServiceProxy } from '../../Services/item-card.service';
import { BillDynamicDeterminantDto, BillDynamicDeterminantList, DeterminantData, DeterminantDataDto, DeterminantsMasterDto, InsertBillDynamicDeterminant, InsertBillDynamicDeterminantDto, ItemCardDeterminantDto } from '../../models/bill-dynamic-determinant';
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
  determinantsData: BillDynamicDeterminantDto[];
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
            this.determinantsData = res.response.dynamicDeterminantListDto;
            this.insertBillDynamicDeterminant.itemCardDeterminantListDto = res.response.itemCardDeterminantListDto;
            console.log(JSON.stringify(this.determinantsData));

            if (this.action == "Edit") {
              this.insertBillDynamicDeterminant.determinantsData = []
              //  this.addItem();
              res.response.dynamicDeterminantListDto.forEach(item => {

                item.determinantsData.forEach(determinant => {
                  debugger
                  const existingRow = item.determinantsData.find(row => row.billDynamicDeterminantSerial === determinant.billDynamicDeterminantSerial);
                  if (existingRow) {
                    debugger
                    // Update existing row
                    // You can decide how you want to handle updates. For now, I'm just updating the quantity.
              
                    existingRow.selectedValue = Number(determinant.valueType) === 1 ? determinant.value : null;
                    existingRow.numberValue = Number(determinant.valueType) === 2 ? determinant.value : null;
                    existingRow.textValue = Number(determinant.valueType) === 3 ? determinant.value : null;
                    existingRow.dateValue = Number(determinant.valueType) === 4 ? determinant.value : null;
                    existingRow.checkedValue = Number(determinant.valueType) === 5 ? determinant.value : null;

                    existingRow.selectedValueId = this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 1)?.determinantId;


                    existingRow.numberValueId = this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 2)?.determinantId;


                    existingRow.textValueId = this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 3)?.determinantId;


                    existingRow.dateValueId = this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 4)?.determinantId;


                    existingRow.checkedValueId = this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 5)?.determinantId;


                  }
                  else {
                    determinant.quantity = item.quantity;
                    this.editItem(determinant);
                  }

                });
              });
              // for (let i = 0; i < this.insertBillDynamicDeterminant.determinantsData.length; i++) {
              //   
              //   var date = this.insertBillDynamicDeterminant.determinantsData?.find(c => c.billDynamicDeterminantSerial == i.toString() && c.valueType == 4);
              //   this.insertBillDynamicDeterminant.determinantsData[i].selectedValue = this.insertBillDynamicDeterminant.determinantsData?.find(c => c.billDynamicDeterminantSerial == i.toString() && c.valueType == 1)?.value;
              //   this.insertBillDynamicDeterminant.determinantsData[i].numberValue = this.insertBillDynamicDeterminant.determinantsData?.find(c => c.billDynamicDeterminantSerial == i.toString() && c.valueType == 2)?.value;
              //   this.insertBillDynamicDeterminant.determinantsData[i].textValue = this.insertBillDynamicDeterminant.determinantsData?.find(c => c.billDynamicDeterminantSerial == i.toString() && c.valueType == 3)?.value;
              //   this.insertBillDynamicDeterminant.determinantsData[i].dateValue = this.dateService.getDateForCalender(date?.value)
              //   this.insertBillDynamicDeterminant.determinantsData[i].checkedValue = Boolean(this.insertBillDynamicDeterminant.determinantsData?.find(c => c.billDynamicDeterminantSerial == i.toString() && c.valueType == 5)?.value);

              // }
            }
            else if (this.insertBillDynamicDeterminant.determinantsData.length == 0) {
              this.addItem();
            }
            if (this.action == "Edit" && this.insertBillDynamicDeterminant.determinantsData.length == 0) {
              for (let i = 0; i < (this.determinantsData.length / this.itemCardDeterminantListDto.length); i++) {
                this.addItem();
              }
            }
            if (this.insertBillDynamicDeterminant.determinantsData) {


              console.log(this.insertBillDynamicDeterminant.determinantsData)
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
      id: item.id,
      itemCardId: item.itemCardId,
      value: value,
      valueType: valueType,
      billDynamicDeterminantSerial: item.billDynamicDeterminantSerial,
      quantity: item.quantity,
    };
  }
  insertBillDynamic() {


    const restructuredData = [];
    this.insertBillDynamicDeterminant.determinantsData = this.insertBillDynamicDeterminant.determinantsData.filter(item => {
      return item.numberValue !== null || item.dateValue != null || item.checkedValue != null || item.textValue != null || item.selectedValue != null;
    });

    this.insertBillDynamicDeterminant.determinantsData.forEach((item) => {

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
    const resultArray = this.processInputData(restructuredData);

    console.log(resultArray);
    console.log(JSON.stringify(restructuredData));
    console.log(JSON.stringify(resultArray));
    this.dialogRef.close(resultArray);


  }
  getDate(selectedDate: DateModel, item) {

    this.date = selectedDate;
    item.dateValue = selectedDate;
  }
  onClose() {
    this.dialog.closeAll();
  }
  addItem() {

    let i = this.insertBillDynamicDeterminant.determinantsData.length;
    this.insertBillDynamicDeterminant.determinantsData.push({

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

      checkedValue: null,
      checkedValueId: this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 5)?.determinantId,
      billDynamicDeterminantSerial: i,
      quantity: 0
    });

  }
  editItem(determinant) {
    debugger
    let i = this.insertBillDynamicDeterminant.determinantsData.length;
    debugger
    this.insertBillDynamicDeterminant.determinantsData.push({
      determinantId: determinant.determinantId,
      id: determinant.id,
      value: determinant.value,
      valueType: Number(determinant.valueType),
      billDynamicDeterminantSerial: this.insertBillDynamicDeterminant.determinantsData.length,
      quantity: determinant.quantity,
      selectedValue: Number(determinant.valueType) === 1 ? determinant.value : null,
      numberValue: Number(determinant.valueType) === 2 ? determinant.value : null,
      textValue: Number(determinant.valueType) === 3 ? determinant.value : null,
      dateValue: Number(determinant.valueType) === 4 ? determinant.value : null,
      checkedValue: Number(determinant.valueType) === 5 ? determinant.value : null,

      selectedValueId: this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 1)?.determinantId,


      numberValueId: this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 2)?.determinantId,


      textValueId: this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 3)?.determinantId,


      dateValueId: this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 4)?.determinantId,


      checkedValueId: this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 5)?.determinantId,

    });
    console.log(this.insertBillDynamicDeterminant.determinantsData);
    console.log(JSON.stringify(this.insertBillDynamicDeterminant.determinantsData));
  }
  deleteItem(i) {
    this.insertBillDynamicDeterminant.determinantsData.splice(i);
    // this.insertBillDynamicDeterminant.determinantsData[i] = null;
  }
  private addDeterminantDataToDto(dto: InsertBillDynamicDeterminantDto, item: any): void {
    const determinantData = new DeterminantData();
    determinantData.determinantId = item.determinantId;
    determinantData.value = item.value.toString();
    determinantData.valueType = item.valueType;
    determinantData.billDynamicDeterminantSerial = item.billDynamicDeterminantSerial;
    dto.determinantsData.push(determinantData);
  }

  private createInsertDto(item: any): InsertBillDynamicDeterminantDto {
    const newInsertDto = new InsertBillDynamicDeterminantDto();
    newInsertDto.billDynamicDeterminantSerial = item.billDynamicDeterminantSerial;
    newInsertDto.quantity = item.quantity;
    const determinantData = new DeterminantData();
    determinantData.determinantId = item.determinantId;
    determinantData.value = item.value.toString();
    determinantData.valueType = item.valueType;
    determinantData.billDynamicDeterminantSerial = item.billDynamicDeterminantSerial;
    newInsertDto.determinantsData.push(determinantData);

    return newInsertDto;
  }
  processInputData(inputData: any[]): InsertBillDynamicDeterminantDto[] {
    const insertDtoArray: InsertBillDynamicDeterminantDto[] = [];

    for (const item of inputData) {
      const insertDto = insertDtoArray.find(dto => dto.billDynamicDeterminantSerial === item.billDynamicDeterminantSerial && dto.quantity === item.quantity);

      if (insertDto) {
        this.addDeterminantDataToDto(insertDto, item);
      } else {
        const newInsertDto = this.createInsertDto(item);
        insertDtoArray.push(newInsertDto);
      }
    }

    return insertDtoArray;
  }
  /////////
}