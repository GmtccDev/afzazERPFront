import {IPagedListMetaData} from '../../../shared/interfaces/paged-list-meta-data';
export class WarehousesUnitDto {
    nameAr: string | undefined;
    nameEn: string | undefined;
    id: number;
    code: string | undefined;
    isActive:boolean| undefined;
    symbol: string | undefined;
}
export class CreateWarehousesUnitCommand {
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    isActive:boolean| undefined;
    symbol: string | undefined;
}
export class EditWarehousesUnitCommand {
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
export class DeleteListWarehousesUnitCommand{
    ids: number[] | undefined;
}

export class WarehousesUnitTransactionDto {
    id: number | undefined;
    warehousesUnitMasterId: number;
    warehousesUnitDetailId: any | undefined;
    transactionDate: any | undefined;
    transactionFactor: number | undefined;
}
export class CreateWarehousesUnitTransactionCommand {
    inputDto: WarehousesUnitTransactionDto;
}
export class EditWarehousesUnitTransactionCommand {
    inputDto: WarehousesUnitTransactionDto;
    id: number | undefined;
}