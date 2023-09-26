
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class ItemCardDto {
    id: number;
    code: string;
    barcode:string | undefined;
    nameAr: string;
    nameEn: string | undefined;
    itemGroupId:number;
    itemTypeId:number;
    costCalculateMethodId:number;
    notes:string;
    model:string;
    manufacturer:string;
    maximum:number;
    minimum:number;
    requestLimit:number;
    description:string;
    isActive: boolean | undefined;
    itemCardUnits:ItemCardUnitsDto[]=[];

}
export class ItemCardUnitsDto {
    id: number;
    unitId: number;
    nameAr: string;
    nameEn: string;
    isActive: boolean | undefined;

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
