
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class PeriodDto {
    id: number;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    isActive: boolean | undefined;
    fromDate: any | undefined;
    toDate: any | undefined;
   
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
