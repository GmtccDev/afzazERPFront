import { Component, Inject, OnInit } from '@angular/core';
import { ItemCardServiceProxy } from '../../Services/item-card.service';
import { BillDynamicDeterminantDto, BillDynamicDeterminantList, DeterminantsMasterDto, InsertBillDynamicDeterminant, ItemCardDeterminantDto } from '../../models/bill-dynamic-determinant';
import { Subscription } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateModel } from 'src/app/shared/model/date-model';
import { DateCalculation } from 'src/app/shared/services/date-services/date-calc.service';

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
  insertBillDynamicDeterminant:InsertBillDynamicDeterminant=new InsertBillDynamicDeterminant();
  date!: DateModel;
  constructor(private itemCardService: ItemCardServiceProxy,  private dialogRef: MatDialogRef<BillDynamicDeterminantComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,    private dateService: DateCalculation,) { }

  ngOnInit(): void {
    this.date=this.dateService.getCurrentDate();
    this.billItemId=this.data.billItemId;
    this.itemCardId=this.data.itemCardId;
    this.getDynamicDeterminant();
  }
  getDynamicDeterminant() {
    return new Promise<void>((resolve, reject) => {
      
      let sub = this.itemCardService.getBillDynamicDeterminant(undefined, this.billItemId, this.itemCardId).subscribe({
        next: (res) => {
          if (res) {
            debugger
            this.dynamicDeterminant = res
            this.itemCardDeterminantListDto = res.response.itemCardDeterminantListDto;
            this.dynamicDeterminantListDto = res.response.dynamicDeterminantListDto;
            this.insertBillDynamicDeterminant.itemCardDeterminantListDto=  res.response.itemCardDeterminantListDto;
          
           
            if (this.insertBillDynamicDeterminant.dynamicDeterminantListDto) {
              for (let i = 0; i < 10; i++) {
                this.insertBillDynamicDeterminant.itemCardDeterminantListDto.forEach(element => {
                  this.insertBillDynamicDeterminant.dynamicDeterminantListDto.push({
                    id: null, // Set appropriate default values for other properties if needed
                    billId: null,
                    billItemId: this.billItemId,
                    itemCardId: this.itemCardId,
                    determinantId: element.determinantId,
                    determinantsMaster: element.determinantsMaster,
                    value: "",
                    valueType: element.determinantsMaster.valueType
                  });
            });
              
                
              }
            }
            debugger
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
  insertBillDynamic() {
    return new Promise<void>((resolve, reject) => {
      debugger
      const restructuredData = [];
      this.insertBillDynamicDeterminant.dynamicDeterminantListDto.forEach((item) => {
        this.insertBillDynamicDeterminant.itemCardDeterminantListDto.forEach((key) => {
          const newObj = {
            billId: item.billId,
            billItemId: item.billItemId,
            determinantId: key.determinantsMaster.id,
            determinantsMaster: item.determinantsMaster,
            id: item.id,
            itemCardId: item.itemCardId,
            value: item[key.determinantsMaster.id],
            valueType: item.valueType
          };
          restructuredData.push(newObj);
        });
      });
      this.insertBillDynamicDeterminant.dynamicDeterminantListDto = this.insertBillDynamicDeterminant.dynamicDeterminantListDto.filter(item => {
        return item.value !== "" && item.value !== null && item.value !== undefined;
    });
      let enity=this.insertBillDynamicDeterminant;
    //   let sub = this.itemCardService.insertBillDynamicDeterminant(enity).subscribe({
    //     next: (res) => {
    //       if (res) {
    //         debugger
    //         this.dynamicDeterminant = res
           
    //       }
    //       resolve();

    //     },
    //     error: (err: any) => {
    //       reject(err);
    //     },
    //     complete: () => {
    //     },
    //   });

    //   this.subsList.push(sub);
     });

  }
  getDate(selectedDate: DateModel) {
    this.date = selectedDate;
  }
}
