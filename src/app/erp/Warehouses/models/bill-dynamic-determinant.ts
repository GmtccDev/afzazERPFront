export class DeterminantsMasterDto {
    id: number;
    code: string;
    nameAr: string;
    nameEn: string;
    valueType:any;
    status:boolean;
    determinantsDetails:DeterminantsDetailDto[]=[];


}
export class DeterminantsDetailDto {
  
    id: number;
    nameAr: string;
    nameEn: string;
    determinantsMasterId:number;
}

export class  BillDynamicDeterminantDto {
    id: number;
    billId: number | null;
    billItemId: number;
    itemCardId: number;
    determinantId: number;
    determinantsMaster: DeterminantsMasterDto;
    value: string;
    valueType: number;
    selectedValue: number;
    numberValue: number;
    textValue: string;
    dateValue: Date;
    checkedValue: false;
    //
    selectedValueId: number;
    numberValueId: number;
    textValueId: number;
    dateValueId: number;
    checkedValueId: number;
  }
  
  export class  BillDynamicDeterminantList {
    dynamicDeterminantListDto: BillDynamicDeterminantDto[];
    itemCardDeterminantListDto: ItemCardDeterminantDto[];
  }
  
  export class  BillDynamicDeterminantInput {
    billId: number | null;
    billItemId: number | null;
    itemCardId: number | null;
  }
  
  export class  InsertBillDynamicDeterminant {
    billId: number | null;
    billItemId: number | null;
    itemCardId: number | null;
    dynamicDeterminantListDto: BillDynamicDeterminantDto[]=[];
    itemCardDeterminantListDto: ItemCardDeterminantDto[]=[];
  }
  
  export class ItemCardDeterminantDto {
    id: number;
    itemCardId: any;
    determinantId: any;
    determinantsMaster:DeterminantsMasterDto;

}