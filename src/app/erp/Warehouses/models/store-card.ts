
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class StoreCardDto {
    id: number;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    isActive: boolean | undefined;
    parentId: number | undefined;
    storekeeper : string | undefined;
    address: string | undefined;
}
export class CreateStoreCard{
    inputDto:StoreCardDto;
}

export class EditStoreCard {
    inputDto:StoreCardDto;
}
export class StoreCardDtoPageList {
    metadata: IPagedListMetaData;
    items: StoreCardDto[] | undefined;
}
export class DeleteListStoreCard{
    ids: number[] | undefined;
}
export class TreeDto {
    id: number;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    isActive: boolean | undefined;
    parentId: number | undefined;
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
  }