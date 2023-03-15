
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
    businessId: number | undefined;
    companySize: string | undefined;
    multiCompanies: boolean | undefined;
    multiBranches: boolean | undefined;
    numberOfCompany: number | undefined;
    numberOfBranch: number | undefined;
}
export class CreateCompanyCommand {
    id: number;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    phoneNumber: string | undefined;
    email: string | undefined;
    isActive: boolean | undefined;
    countryId: number | undefined;
    businessId: number | undefined;
    companySize: string | undefined;
    multiCompanies: boolean | undefined;
    multiBranches: boolean | undefined;
    numberOfCompany: number | undefined;
    numberOfBranch: number | undefined;
}

export class EditCompanyCommand {
    id: number;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    phoneNumber: string | undefined;
    email: string | undefined;
    isActive: boolean | undefined;
    countryId: number | undefined;
    businessId: number | undefined;
    companySize: string | undefined;
    multiCompanies: boolean | undefined;
    multiBranches: boolean | undefined;
    numberOfCompany: number | undefined;
    numberOfBranch: number | undefined;
}
export class CompanyDtoPageList {
    metadata: IPagedListMetaData;
    items: CompanyDto[] | undefined;
}
export class DeleteListCompanyCommand {
    ids: number[] | undefined;
}
