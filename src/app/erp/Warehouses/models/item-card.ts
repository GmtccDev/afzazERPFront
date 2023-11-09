
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class ItemCardDto {
    id: number;
    companyId: number;
    branchId: number;
    code: string;
    barcode: string | undefined;
    nameAr: string;
    nameEn: string | undefined;
    itemGroupId: number;
    itemType: number | undefined;
    image: string | undefined;
    costCalculateMethod: number | undefined;
    notes: string | undefined;
    model: string | undefined;
    manufacturer: string | undefined;
    maxLimit: number | undefined;
    minLimit: number | undefined;
    reorderLimit: number | undefined;
    description: string | undefined;
    isActive: boolean;
    mainUnitId: number | undefined;
    sellingPrice: number | undefined;
    consumerPrice: number | undefined;
    minSellingPrice: number | undefined;
    openingCostPrice: number | undefined;
    hasExpiredDate: boolean | undefined;
    lifeTime: number | undefined;
    lifeTimeType: number | undefined;
    hasSerialNumber: boolean | undefined;
    quantity: number | undefined;
    warrantyPeriod: number | undefined;
    warrantyType: number | undefined;
    itemKind: number | undefined;
    taxIds: string | undefined;

    heightFactor: number | undefined;
    widthFactor: number | undefined;
    lengthFactor: number | undefined;
    attachment:string | undefined;
    salesAccountId: number | undefined;
    salesReturnsAccountId: number | undefined;
    purchasesAccountId: number | undefined;
    purchasesReturnsAccountId: number | undefined;
    salesCostAccountId: number | undefined;
    inventoryAccountId: number | undefined;
    itemCardUnits: ItemCardUnitDto[] = [];
    itemCardAlternatives: ItemCardAlternativeDto[] = [];

}
export class ItemCardUnitDto {
    id: number;
    itemCardId: any;
    unitId: any;
    transactionFactor: number;
    sellingPrice: number | undefined;
    minSellingPrice: number | undefined;
    consumerPrice: number | undefined;
    openingCostPrice: number | undefined;
    unitNameAr: string | undefined;
    unitNameEn: string | undefined;
    unitCode: string | undefined;


}
export class ItemCardAlternativeDto {
    id: number;
    itemCardId: any;
    alternativeItemId: any;
    costPrice: number | undefined;
    sellingPrice: number | undefined;
    alternativeType: number;
    currentBalance: number;


}
export class CreateItemCard {
    inputDto: ItemCardDto;
}

export class EditItemCard {
    inputDto: ItemCardDto;
}
export class ItemCardDtoPageList {
    metadata: IPagedListMetaData;
    items: ItemCardDto[] | undefined;
}
export class DeleteListItemCard {
    ids: number[] | undefined;
}
