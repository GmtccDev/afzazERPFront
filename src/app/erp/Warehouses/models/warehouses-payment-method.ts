
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class WarehousesPaymentMethodDto {
    id: number;
    nameAr: string;
    nameEn: string;
    code: string;
    isActive: boolean | undefined;
    accountId: any;
   
}
export class CreateWarehousesPaymentMethod {
    inputDto:WarehousesPaymentMethodDto;
}

export class EditWarehousesPeriod {
    inputDto:WarehousesPaymentMethodDto;
}
export class WarehousesPaymentMethodDtoPageList {
    metadata: IPagedListMetaData;
    items: WarehousesPaymentMethodDto[] | undefined;
}
export class DeleteListWarehousesPaymentMethod {
    ids: number[] | undefined;
}
