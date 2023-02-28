import {IPagedListMetaData} from '../../../shared/interfaces/paged-list-meta-data';
export class UserDto {
    id: string | undefined;
   //userName: string | undefined;
    fullName: string | undefined;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    userType: string | undefined;
    phoneNumber: string | undefined;
    email: string | undefined;
   // passWord: string | undefined;
    roles: string[] | undefined;
    isActive: boolean | undefined;
}
export class CreateUserCommand {
   //userName: string | undefined;
    fullName: string | undefined;
    nameAr: string | undefined;
    nameEn: string | undefined;
    phoneNumber: string | undefined;
    isActive: boolean | undefined;
    email: string | undefined;
    code: string | undefined;
    roles: string[] | undefined;
   // password: string | undefined;
}
export class EditUserCommand {
   //userName: string | undefined;
    fullName: string | undefined;
    nameAr: string | undefined;
    nameEn: string | undefined;
    phoneNumber: string | undefined;
    isActive: boolean | undefined;
    email: string | undefined;
    id: string | undefined;
    roles: string[] | undefined;
   // password: string | undefined;
    code: string | undefined;

}

export interface IUserDtoPageList {
    metadata: IPagedListMetaData;
    items: UserDto[] | undefined;
}
export class DeleteListUserCommand{
    ids: number[] | undefined;
}
export interface IAddPasswordUserCommand {
    newPassword: string | undefined;
    confirmNewPassword: string | undefined;
    email: string | undefined;
}
export interface IChangePasswordCommand {
    oldPassword: string | undefined;
    newPassword: string | undefined;
    confirmNewPassword: string | undefined;
}