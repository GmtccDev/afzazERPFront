import { publishBehavior } from 'rxjs';
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export interface ICustomerDto {
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
export interface ICreateCustomerCommand {
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

export interface IEditCustomerCommand {
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
export interface ICustomerDtoPageList {
    metadata: IPagedListMetaData;
    items: ICustomerDto[] | undefined;
}
export class DeleteListCustomerCommand {
    ids: number[] | undefined;
}
export interface IVerifyCodeCommand {
    code: string | undefined;
    email: string | undefined;
}
export class CustomerSubscriptionDto {
    id: number | undefined;
    customerId: number;
    serverNameAr: string | undefined;
    serverNameEn: string | undefined;
    databaseNameAr: string | undefined;
    databaseNameEn: string | undefined;
    subDomain: string | undefined;
    contractStartDate: any | undefined;
    contractEndDate: any | undefined;
    applications: string | undefined;
}
export class CreateCustomerSubscriptionCommand {
    inputDto: CustomerSubscriptionDto;
}
export class EditCustomerSubscriptionCommand {
    inputDto: CustomerSubscriptionDto;
    id: number | undefined;
}
