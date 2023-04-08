
import { FiscalPeriodStatus } from '../../../shared/enum/fiscal-period-status';
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class FiscalPeriodDto {
    id: number;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    isActive: boolean | undefined;
    fromDate: any | undefined;
    toDate: any | undefined;
    fiscalPeriodStatus:FiscalPeriodStatus;
    fiscalPeriodStatusName:string | undefined;
}
export class CreateFiscalPeriodCommand {
    inputDto:FiscalPeriodDto;
}

export class EditFiscalPeriodCommand {
    inputDto:FiscalPeriodDto;
}
export class FiscalPeriodDtoPageList {
    metadata: IPagedListMetaData;
    items: FiscalPeriodDto[] | undefined;
}
export class DeleteListFiscalPeriodCommand {
    ids: number[] | undefined;
}
