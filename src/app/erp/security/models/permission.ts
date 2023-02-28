import { IPagedListMetaData } from "../../../shared/interfaces/paged-list-meta-data";
export interface CreatePermissionDto {
    id: string | undefined;
    name: string | undefined;
    controllerNameAr: string | undefined;
    controllerNameEn: string | undefined;
    actionNameAr: string | undefined;
    actionNameEn: string | undefined;
    isChecked: boolean | undefined;
}
export class ICreatePermissionCommand {
    roleId: string | undefined;
    permissions: CreatePermissionDto[] | undefined;
}
export class PermissionDto {
    nameAr: string | undefined;
    nameEn: string | undefined;
    id: number;
    code: string | undefined;
    isActive:boolean| undefined;
}

export class EditPermissionCommand {
    nameAr: string | undefined;
    nameEn: string | undefined;
    id: number;
    code: string | undefined;
    isActive:boolean| undefined;
}

export interface IPermissionDtoPageList {
    metadata: IPagedListMetaData;
    items: PermissionDto[] | undefined;
}
export class DeleteListPermissionCommand{
    ids: number[] | undefined;
}

export interface IGetAllPermissionDTO {
    id: string | undefined;
    name: string | undefined;
    controllerNameAr: string | undefined;
    controllerNameEn: string | undefined;
    actionNameAr: string | undefined;
    actionNameEn: string | undefined;
    isChecked: boolean | undefined;
    roleId: string | undefined;
}
