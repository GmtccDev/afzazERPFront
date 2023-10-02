
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class PeriodDto {
    id: number;
    companyId: number;
    branchId: number;
    nameAr: string;
    nameEn: string | undefined;
    code: string;
    isActive: boolean | undefined;
    fromDate: any;
    toDate: any;
   
}
export class CreatePeriodCommand {
    inputDto:PeriodDto;
}

export class EditPeriodCommand {
    inputDto:PeriodDto;
}
export class PeriodDtoPageList {
    metadata: IPagedListMetaData;
    items: PeriodDto[] | undefined;
}
export class DeleteListPeriodCommand {
    ids: number[] | undefined;
}
