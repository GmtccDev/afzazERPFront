export class DeterminantsMasterDto {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  valueType: any;
  status: boolean;
  determinantsDetails: DeterminantsDetailDto[] = [];


}
export class DeterminantsDetailDto {

  id: number;
  nameAr: string;
  nameEn: string;
  determinantsMasterId: number;
}

export class BillDynamicDeterminantDto {
  id: number;
  billId: number | null;
  billItemId: number;
  itemCardId: number;
  determinantId: number;
  // determinantsMaster: DeterminantsMasterDto;
  value: string;
  valueType: any;
  selectedValue: any;
  numberValue: any;
  textValue: any;
  dateValue: any;
  checkedValue: any;
  //
  selectedValueId: number;
  numberValueId: number;
  textValueId: number;
  dateValueId: number;
  checkedValueId: number;
  itemCardSerial: string | undefined;
  billDynamicDeterminantSerial: any | undefined;
  quantity:any;
}

export class BillDynamicDeterminantList {
  determinantsData: BillDynamicDeterminantDto[];
  itemCardDeterminantListDto: ItemCardDeterminantDto[];
}

export class BillDynamicDeterminantInput {
  billId: number | null;
  billItemId: number | null;
 
}

export class InsertBillDynamicDeterminant {
  billId: number | null;
  billItemId: number | null;
  billDynamicDeterminantSerial: string | undefined;
  determinantsData: DeterminantDataDto[] = [];
  itemCardDeterminantListDto: ItemCardDeterminantDto[] = [];
  quantity: number | null;
}
export class InsertBillDynamicDeterminantDto {
  billId: number | null;
  billItemId: number | null;
  billDynamicDeterminantSerial: string | undefined;
  determinantsData: DeterminantData[] = [];
  quantity: number | null;
}
export class ItemCardDeterminantDto {
  id: number;
  itemCardId: any;
  determinantId: any;
  determinantsMaster: DeterminantsMasterDto;

}
export class DeterminantDataDto {
  id: number;
  determinantId: number | null;
  value: string | null;
  valueType: any | null;
  selectedValue: any | null;
  numberValue: any | null;
  textValue: any | null;
  dateValue: any | null;
  checkedValue: any | null;
  //
  selectedValueId: number | null;
  numberValueId: number | null;
  textValueId: number | null;
  dateValueId: number | null;
  checkedValueId: number | null;
  billDynamicDeterminantSerial:any
  quantity: number | null;
}

export class DeterminantData {

  determinantId: number | null;
  value: string | null;
  valueType: string | null;
  billDynamicDeterminantSerial:any;
}