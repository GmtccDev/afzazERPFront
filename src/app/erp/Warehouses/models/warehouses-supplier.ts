
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class WarehousesSupplierDto {
    id: number;
    code: string;
    nameAr: string;
    nameEn: string;
    phone: string;
    responsiblePerson: string;
    accountId: any;
    fax: string | undefined;
    email: string | undefined;
    countryId: any;
    isActive: boolean | undefined;

}
export class CreateWarehousesSupplier {
    inputDto: WarehousesSupplierDto;
}

export class EditWarehousesSupplier {
    inputDto: WarehousesSupplierDto;
}
export class WarehousesSupplierDtoPageList {
    metadata: IPagedListMetaData;
    items: WarehousesSupplierDto[] | undefined;
}
export class DeleteListWarehousesSupplier {
    ids: number[] | undefined;
}
