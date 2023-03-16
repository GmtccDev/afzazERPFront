
import { IPagedListMetaData } from '../../../shared/interfaces/paged-list-meta-data';
export class BranchDto {
    id: number;
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    phoneNumber: string | undefined;
    email: string | undefined;
    isActive: boolean | undefined;
    countryId: number | undefined;
    companyId: number | undefined;
}
export class CreateBranchCommand {
    inputDto:BranchDto;
}

export class EditBranchCommand {
    inputDto:BranchDto;
}
export class BranchDtoPageList {
    metadata: IPagedListMetaData;
    items: BranchDto[] | undefined;
}
export class DeleteListBranchCommand {
    ids: number[] | undefined;
}
