
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class WarehousesCustomerDto {
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
export class CreateWarehousesCustomer {
    inputDto: WarehousesCustomerDto;
}

export class EditWarehousesCustomer {
    inputDto: WarehousesCustomerDto;
}
export class WarehousesCustomerDtoPageList {
    metadata: IPagedListMetaData;
    items: WarehousesCustomerDto[] | undefined;
}
export class DeleteListWarehousesCustomer {
    ids: number[] | undefined;
}
