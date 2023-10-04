
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class CustomerCardDto {
    id: number;
    companyId: number;
    branchId: number;
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
export class CreateCustomerCard {
    inputDto: CustomerCardDto;
}

export class EditCustomerCard {
    inputDto: CustomerCardDto;
}
export class CustomerCardDtoPageList {
    metadata: IPagedListMetaData;
    items: CustomerCardDto[] | undefined;
}
export class DeleteListCustomerCard {
    ids: number[] | undefined;
}
