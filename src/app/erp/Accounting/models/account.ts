
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class AccountDto {
    id: number;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    isActive: boolean | undefined;
    parentId: number | undefined;
    openBalanceDebit: number | undefined;
    openBalanceCredit: number | undefined;
    debitLimit: number | undefined;
    creditLimit: number | undefined;
    taxNumber: string | undefined;
    companyId: number | undefined;
    currencyId: number | undefined;
    costCenterId: number | undefined;
    accountGroupId: number | undefined;
    isLeafAccount: boolean | undefined;
    accountType: number | undefined;
}
export class CreateAccountCommand {
    inputDto: AccountDto;
}

export class EditAccountCommand {
    inputDto: AccountDto;
}
export class AccountDtoPageList {
    metadata: IPagedListMetaData;
    items: AccountDto[] | undefined;
}
export class DeleteListAccountCommand {
    ids: number[] | undefined;
}
export class DeleteAccountCommand {
    id: any | undefined;
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
    treeId: string;
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
    isLeafAccount: boolean | undefined;
}