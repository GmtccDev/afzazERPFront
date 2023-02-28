import {IPagedListMetaData} from '../../../shared/interfaces/paged-list-meta-data';
export class BusinessDto {
    nameAr: string | undefined;
    nameEn: string | undefined;
    id: number;
    code: string | undefined;
    isActive:boolean| undefined;
}
export class CreateBusinessCommand {
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    isActive:boolean| undefined;
}
export class EditBusinessCommand {
    nameAr: string | undefined;
    nameEn: string | undefined;
    id: number;
    code: string | undefined;
    isActive:boolean| undefined;
}
export interface IBusinessDtoPageList {
    metadata: IPagedListMetaData;
    items: BusinessDto[] | undefined;
}
export class DeleteListBusinessCommand{
    ids: number[] | undefined;
}