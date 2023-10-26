import {IPagedListMetaData} from '../../../shared/interfaces/paged-list-meta-data';
export class JournalDto {
    nameAr: string | undefined;
    nameEn: string | undefined;
    id: number;
    code: string | undefined;
    isActive:boolean| undefined;
}
export class CreateJournalCommand {
    nameAr: string | undefined;
    nameEn: string | undefined;
    code: string | undefined;
    isActive:boolean| undefined;
}
export class EditJournalCommand {
    nameAr: string | undefined;
    nameEn: string | undefined;
    id: number;
    code: string | undefined;
    isActive:boolean| undefined;
}
export interface IJournalDtoPageList {
    metadata: IPagedListMetaData;
    items: JournalDto[] | undefined;
}
export class DeleteListJournalCommand{
    ids: number[] | undefined;
}
export class JournalEntryDetail {
    id: number | null;
    journalEntriesMasterId: number | null;
    accountId: number | null;
    currencyId: number | null;
    transactionFactor: number | null;
    notes: string;
    jeDetailCredit: number;
    jeDetailDebit: number;
    costCenterId: number | null;
    costCenterName: string;
    currencyName: string;
    accountName: string;
    jeDetailCreditLocal: number;
    jeDetailDebitLocal: number;
    jeDetailSerial: number;}