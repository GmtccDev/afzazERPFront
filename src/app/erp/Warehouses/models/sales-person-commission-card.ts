import { IPagedListMetaData } from './../../../shared/interfaces/paged-list-meta-data';

export class SalesPersonCommissionCardDto {
    id: number;
    code: number;
    salesPersonId: number;
    calculationMethod: number;
    type: number;
    target: number;
    commissonOn: number;
    achievedTargetRatio: number;
    notAchievedTargetRatio: number;
}
export class CreateSalesPersonCommission {
    inputDto: SalesPersonCommissionCardDto;
}

export class EditSalesPersonCommissionCard {
    inputDto: SalesPersonCommissionCardDto;
}
export class SalesPersonCardDtoPageList {
    metadata: IPagedListMetaData;
    items: SalesPersonCommissionCardDto[] | undefined;
}
export class DeleteListSalesPersonCommissionCard {
    ids: number[] | undefined;
}
