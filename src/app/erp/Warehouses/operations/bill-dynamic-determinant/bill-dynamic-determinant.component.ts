import { Component, Inject, OnInit } from '@angular/core';
import { ItemCardServiceProxy } from '../../Services/item-card.service';
import { BillDynamicDeterminantDto, BillDynamicDeterminantList, DeterminantData, DeterminantDataDto, DeterminantsMasterDto, InsertBillDynamicDeterminant, InsertBillDynamicDeterminantDto, ItemCardDeterminantDto } from '../../models/bill-dynamic-determinant';
import { Subscription } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DateModel } from 'src/app/shared/model/date-model';
import { DateCalculation } from 'src/app/shared/services/date-services/date-calc.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataShareService } from '../../Services/share-data.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-bill-dynamic-determinant',
  templateUrl: './bill-dynamic-determinant.component.html',
  styleUrls: ['./bill-dynamic-determinant.component.scss']
})
export class BillDynamicDeterminantComponent implements OnInit {
  dynamicDeterminant: BillDynamicDeterminantList;
  subsList: Subscription[] = [];
  billItemId: any;
  determinantsData: BillDynamicDeterminantDto[];
  itemCardDeterminantListDto: ItemCardDeterminantDto[];
  insertBillDynamicDeterminant: InsertBillDynamicDeterminant = new InsertBillDynamicDeterminant();
  date!: DateModel;
  form: FormGroup;
  action: any;
  lang = localStorage.getItem("language");
  sharedData: any;
  existingArray: DeterminantDataDto[] = [];
  itemCardId: any;
  constructor(private itemCardService: ItemCardServiceProxy, private dialogRef: MatDialogRef<BillDynamicDeterminantComponent>,private datePipe: DatePipe, private dataService: DataShareService,
    @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, private dateService: DateCalculation, public dialog: MatDialog) { }

  ngOnInit(): void {

    // this.date = this.dateService.getCurrentDate();
    this.billItemId = this.data.billItemId;
    this.itemCardId = this.data.itemCardId;
    this.action = this.data.action;

    this.form = this.fb.group({});

    this.getDynamicDeterminant();
  }
  getDynamicDeterminant() {
    return new Promise<void>((resolve, reject) => {

      let sub = this.itemCardService.getBillDynamicDeterminant(this.billItemId, this.itemCardId).subscribe({
        next: (res) => {
          if (res) {

            this.dynamicDeterminant = res
            this.itemCardDeterminantListDto = res.response.itemCardDeterminantListDto;
            this.determinantsData = res.response.dynamicDeterminantListDto;
            this.insertBillDynamicDeterminant.itemCardDeterminantListDto = res.response.itemCardDeterminantListDto;


            if (this.action == "Edit") {
              this.insertBillDynamicDeterminant.determinantsData = []
              //  this.addItem();
              res.response.dynamicDeterminantListDto.forEach(item => {

                item.determinantsData.forEach(determinant => {

                  const existingRow = this.existingArray.find(row => row.billDynamicDeterminantSerial === determinant.billDynamicDeterminantSerial);
                  if (existingRow) {

                    // Update existing row
                    // You can decide how you want to handle updates. For now, I'm just updating the quantity.
                    if (!existingRow.selectedValue)
                      existingRow.selectedValue = Number(determinant.valueType) === 1 ? determinant.value : null;
                    if (!existingRow.numberValue)
                      existingRow.numberValue = Number(determinant.valueType) === 2 ? determinant.value : null;
                    if (!existingRow.textValue)
                      existingRow.textValue = Number(determinant.valueType) === 3 ? determinant.value : null;
                    if (!existingRow.dateValue)
                      existingRow.dateValue = Number(determinant.valueType) === 4 ? (determinant.value) : null;
                    if (!existingRow.checkedValue)
                      existingRow.checkedValue = Number(determinant.valueType) === 5 ? (determinant.value) : null;



                  }
                  else {
                    determinant.quantity = item.quantity;
                    this.editItem(determinant);
                  }

                });
              });
              debugger
              this.existingArray.forEach(obj => {
                debugger
                obj.checkedValue =obj.checkedValue === "true";
               obj.dateValue = this.dateService.getDateForCalender(obj.dateValue);;
              });
              this.insertBillDynamicDeterminant.determinantsData = this.existingArray;

            }
            else if (this.insertBillDynamicDeterminant.determinantsData.length == 0) {
              this.addItem();
            }

            if (this.action == "Edit" && this.insertBillDynamicDeterminant.determinantsData.length == 0) {
              for (let i = 0; i < 1; i++) {
                this.addItem();
              }
            }


            console.log(JSON.stringify(this.insertBillDynamicDeterminant.determinantsData))



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


    this.dataService.updateData(resultArray);
    this.dialog.closeAll();


  }
  getDate(selectedDate: DateModel, item) {
debugger
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


    this.existingArray.push({
      determinantId: determinant.determinantId,
      id: determinant.id,
      value: null,
      valueType: null,
      billDynamicDeterminantSerial: this.existingArray.length,
      quantity: determinant.quantity,
      selectedValue: Number(determinant.valueType) === 1 ? determinant.value : null,
      numberValue: Number(determinant.valueType) === 2 ? determinant.value : null,
      textValue: Number(determinant.valueType) === 3 ? determinant.value : null,
      dateValue: Number(determinant.valueType) === 4 ? determinant.value : null,
      checkedValue: Number(determinant.valueType) === 5 ? (determinant.value) : null,

      selectedValueId: this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 1)?.determinantId,


      numberValueId: this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 2)?.determinantId,


      textValueId: this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 3)?.determinantId,


      dateValueId: this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 4)?.determinantId,


      checkedValueId: this.insertBillDynamicDeterminant.itemCardDeterminantListDto?.find(c => c.determinantsMaster.valueType == 5)?.determinantId,

    });

  }
  deleteItem(i) {
    this.insertBillDynamicDeterminant.determinantsData.splice(i);

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