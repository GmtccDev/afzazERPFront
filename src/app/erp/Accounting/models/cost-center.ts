
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class CostCenterDto {
    id: number;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    isActive: boolean | undefined;
    parentId: number | undefined;
    companyId: number | undefined;
}
export class CreateCostCenterCommand {
    inputDto:CostCenterDto;
}

export class EditCostCenterCommand {
    inputDto:CostCenterDto;
}
export class CostCenterDtoPageList {
    metadata: IPagedListMetaData;
    items: CostCenterDto[] | undefined;
}
export class DeleteListCostCenterCommand {
    ids: number[] | undefined;
}
export class TreeDto {
    id: number;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    isActive: boolean | undefined;
    parentId: number | undefined;
    companyId: number | undefined;
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
    companyId: number | undefined;
  }