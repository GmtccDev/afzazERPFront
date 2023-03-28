
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class GeneralConfigurationDto {
    id: number;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    value: string | undefined;
    isActive: boolean | undefined;
    valueType :ValueTypeEnum| undefined;
    moduleType :ModuleType| undefined;
 
}
export class CreateGeneralConfigurationCommand {
    inputDto:GeneralConfigurationDto;
}
export class GeneralConfiguration{
    id: number;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    value: string | undefined;
    isActive: boolean | undefined;
    valueType :ValueTypeEnum| undefined;
    moduleType :ModuleType| undefined;
}
export class EditGeneralConfigurationCommand {
    generalConfiguration: GeneralConfigurationDto[] = [];
}
export class GeneralConfigurationDtoPageList {
    metadata: IPagedListMetaData;
    items: GeneralConfigurationDto[] | undefined;
}
export class DeleteListGeneralConfigurationCommand {
    ids: number[] | undefined;
}
export enum ValueTypeEnum 
{

    Boolean = 1,
    Intger = 2,
    Fraction = 3,
    text = 4
}
export enum ModuleType
{

    Accounting = 1
}
