import {IPagedListMetaData} from '../../../shared/interfaces/paged-list-meta-data';
export class UnitDto {
    nameAr: string | undefined;
    nameEn: string | undefined;
    id: number;
    code: string | undefined;
    isActive:boolean| undefined;
    symbol: string | undefined;
}
export class CreateUnit  {
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    isActive:boolean| undefined;
    symbol: string | undefined;
}
export class EditUnit  {
    nameAr: string | undefined;
    nameEn: string | undefined;
    id: number;
    code: string | undefined;
    isActive:boolean| undefined;
    symbol: string | undefined;
}

export interface IUnitDtoPageList {
    metadata: IPagedListMetaData;
    items: UnitDto[] | undefined;
}
export class DeleteListUnit {
    ids: number[] | undefined;
}

export class UnitTransactionDto {
    id: number | undefined;
    unitMasterId: number;
    unitDetailId: any | undefined;
    transactionDate: any | undefined;
    transactionFactor: number | undefined;
}
export class CreateUnitTransaction  {
    inputDto: UnitTransactionDto;
}
export class EditUnitTransaction  {
    inputDto: UnitTransactionDto;
    id: number | undefined;
}