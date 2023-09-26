
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class ItemGroupsCardDto {
    id: number;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    isActive: boolean | undefined;
    parentId: number | undefined;
    itemType:any;
    costCalculation:any
    warehousesUnitID:number;
}
export class CreateItemGroupsCard{
    inputDto:ItemGroupsCardDto;
}

export class EditItemGroupsCard {
    inputDto:ItemGroupsCardDto;
}
export class ItemGroupsCardDtoPageList {
    metadata: IPagedListMetaData;
    items: ItemGroupsCardDto[] | undefined;
}
export class DeleteListItemGroupsCard{
    ids: number[] | undefined;
}
export class TreeDto {
    id: number;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    isActive: boolean | undefined;
    parentId: number | undefined;
    itemType:any;
    costCalculation:any
    warehousesUnitID:number;
}
export interface TreeNodeInterface {
   treeId:string;
    levelId?: number;
    expanded?: boolean;
    children?: TreeNodeInterface[];
    id: number;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    isActive: boolean | undefined;
    parentId: number | undefined;
    parent?: TreeNodeInterface;
    itemType:any;
    costCalculation:any
    warehousesUnitID:number;
  }
   enum ItemType
  {
       Warehouse,
       Service
  }
   enum CostCalculation
  {
      LastPurchasePrice,
      OpeningPrice,
      ActualAverage,
      HighestPrice

  }