
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class CompanyDto {
    id: number;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    phoneNumber: string | undefined;
    email: string | undefined;
    isActive: boolean | undefined;
    countryId: number | undefined;
    currencyId: number | undefined;

    motherCompany: boolean | undefined;
    useHijri: boolean | undefined;
    logo: string | undefined;
    webSite: string | undefined;
}
export class CreateCompanyCommand {
    inputDto:CompanyDto;
}

export class EditCompanyCommand {
    inputDto:CompanyDto;
}
export class CompanyDtoPageList {
    metadata: IPagedListMetaData;
    items: CompanyDto[] | undefined;
}
export class DeleteListCompanyCommand {
    ids: number[] | undefined;
}
