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
  billDynamicDeterminantSerial: string | undefined;
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
  valueType: string | null;
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
  billDynamicDeterminantSerial:any
  quantity: number | null;
}