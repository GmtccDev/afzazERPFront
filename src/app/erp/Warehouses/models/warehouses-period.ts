
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class WarehousesPeriodDto {
    id: number;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    isActive: boolean | undefined;
    fromDate: any | undefined;
    toDate: any | undefined;
   
}
export class CreateWarehousesPeriodCommand {
    inputDto:WarehousesPeriodDto;
}

export class EditWarehousesPeriodCommand {
    inputDto:WarehousesPeriodDto;
}
export class WarehousesPeriodDtoPageList {
    metadata: IPagedListMetaData;
    items: WarehousesPeriodDto[] | undefined;
}
export class DeleteListWarehousesPeriodCommand {
    ids: number[] | undefined;
}
