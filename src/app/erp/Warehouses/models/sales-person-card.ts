import { IPagedListMetaData } from "src/app/shared/interfaces/paged-list-meta-data";

export class SalesPersonCardDto {
    id: number;
    code: string;
    nameAr: string;
    nameEn: string;
    phone: string;
    accountId: any;
    fax: string | undefined;
    email: string | undefined;
    countryId: any;
    isActive: boolean | undefined;

}
export class CreateSalesPersonCard {
    inputDto: SalesPersonCardDto;
}

export class EditSalesPersonCard {
    inputDto: SalesPersonCardDto;
}
export class SalesPersonCardDtoPageList {
    metadata: IPagedListMetaData;
    items: SalesPersonCardDto[] | undefined;
}
export class DeleteListSalesPersonCard {
    ids: number[] | undefined;
}
