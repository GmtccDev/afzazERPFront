
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class SupplierCardDto {
    id: number;
    code: string;
    companyId: number;
    branchId: number;
    nameAr: string;
    nameEn: string;
    phone: string;
    responsiblePerson: string;
    accountId: any;
    fax: string | undefined;
    email: string | undefined;
    countryId: any;
    taxNumber:string|undefined;
    postalCode:string|undefined;
    mailBox:string|undefined;
    creditLimit:number|undefined;
    initialBalance:number|undefined;
    isActive: boolean | undefined;

}
export class CreateSupplierCard {
    inputDto: SupplierCardDto;
}

export class EditSupplierCard {
    inputDto: SupplierCardDto;
}
export class SupplierCardDtoPageList {
    metadata: IPagedListMetaData;
    items: SupplierCardDto[] | undefined;
}
export class DeleteListSupplierCard {
    ids: number[] | undefined;
}
