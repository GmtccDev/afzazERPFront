
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class AccountGroupDto {
    id: number;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    isActive: boolean | undefined;
    parentId: number | undefined;
}
export class CreateAccountGroupCommand {
    inputDto:AccountGroupDto;
}

export class EditAccountGroupCommand {
    inputDto:AccountGroupDto;
}
export class AccountGroupDtoPageList {
    metadata: IPagedListMetaData;
    items: AccountGroupDto[] | undefined;
}
export class DeleteListAccountGroupCommand {
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