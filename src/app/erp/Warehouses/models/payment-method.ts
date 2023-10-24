
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class PaymentMethodDto {
    id: number;
    companyId: number;
    branchId: number;
    nameAr: string;
    nameEn: string |undefined;
    code: string;
    isActive: boolean | undefined;
    accountId: any;
   
}
export class CreatePaymentMethod {
    inputDto:PaymentMethodDto;
}

export class EditPaymentMethod {
    inputDto:PaymentMethodDto;
}
export class PaymentMethodDtoPageList {
    metadata: IPagedListMetaData;
    items: PaymentMethodDto[] | undefined;
}
export class DeleteListPaymentMethod {
    ids: number[] | undefined;
}
