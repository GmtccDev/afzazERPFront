import { IPagedListMetaData } from "src/app/shared/interfaces/paged-list-meta-data";

export class AccountingPeriodDto {
    id: number;
    companyId: number;
    fiscalPeriodId: number;
    fromDate: any;
    toDate: any;
    //isActive: boolean | undefined;

   
}
export class CreateAccountingPeriodCommand {
    inputDto:AccountingPeriodDto;
}

export class EditAccountingPeriodCommand {
    inputDto:AccountingPeriodDto;
}
export class AccountingPeriodDtoPageList {
    metadata: IPagedListMetaData;
    items: AccountingPeriodDto[] | undefined;
}
export class DeleteListAccountingPeriodCommand {
    ids: number[] | undefined;
}



