import {IPagedListMetaData} from '../../../shared/interfaces/paged-list-meta-data';
export class WarehousesUnitDto {
    nameAr: string | undefined;
    nameEn: string | undefined;
    id: number;
    code: string | undefined;
    isActive:boolean| undefined;
    symbol: string | undefined;
}
export class CreateWarehousesUnit  {
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    isActive:boolean| undefined;
    symbol: string | undefined;
}
export class EditWarehousesUnit  {
    nameAr: string | undefined;
    nameEn: string | undefined;
    id: number;
    code: string | undefined;
    isActive:boolean| undefined;
    symbol: string | undefined;
}

export interface IWarehousesUnitDtoPageList {
    metadata: IPagedListMetaData;
    items: WarehousesUnitDto[] | undefined;
}
export class DeleteListWarehousesUnit {
    ids: number[] | undefined;
}

export class WarehousesUnitTransactionDto {
    id: number | undefined;
    warehousesUnitMasterId: number;
    warehousesUnitDetailId: any | undefined;
    transactionDate: any | undefined;
    transactionFactor: number | undefined;
}
export class CreateWarehousesUnitTransaction  {
    inputDto: WarehousesUnitTransactionDto;
}
export class EditWarehousesUnitTransaction  {
    inputDto: WarehousesUnitTransactionDto;
    id: number | undefined;
}