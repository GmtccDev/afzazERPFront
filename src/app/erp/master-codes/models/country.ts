import {IPagedListMetaData} from '../../../shared/interfaces/paged-list-meta-data';
export class CountryDto {
    nameAr: string | undefined;
    nameEn: string | undefined;
    id: number;
    code: string | undefined;
    isActive:boolean| undefined;
}
export class CreateCountryCommand {
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    isActive:boolean| undefined;
}
export class EditCountryCommand {
    nameAr: string | undefined;
    nameEn: string | undefined;
    id: number;
    code: string | undefined;
    isActive:boolean| undefined;
}

export interface ICountryDtoPageList {
    metadata: IPagedListMetaData;
    items: CountryDto[] | undefined;
}
export class DeleteListCountryCommand{
    ids: number[] | undefined;
}