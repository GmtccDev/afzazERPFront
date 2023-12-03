import { Component, Inject, OnInit } from '@angular/core';
import { ItemCardServiceProxy } from '../../Services/item-card.service';
import { BillDynamicDeterminantDto, BillDynamicDeterminantList, DeterminantsMasterDto, InsertBillDynamicDeterminant, ItemCardDeterminantDto } from '../../models/bill-dynamic-determinant';
import { Subscription } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
  constructor(private itemCardService: ItemCardServiceProxy,  private dialogRef: MatDialogRef<BillDynamicDeterminantComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    
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
              for (let i = 0; i < 15; i++) {
            
                this.insertBillDynamicDeterminant.dynamicDeterminantListDto.push({
                    id: null, // Set appropriate default values for other properties if needed
                    billId: null,
                    billItemId: null,
                    itemCardId: null,
                    determinantId: null,
                    determinantsMaster: new DeterminantsMasterDto(),
                    value: "",
                    valueType: null
                  });
                
              }
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
}
