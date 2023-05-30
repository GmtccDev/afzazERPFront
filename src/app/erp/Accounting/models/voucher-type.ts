export class VoucherType {
    id: number;
    companyId: number; 
    voucherNameAr: string;
    voucherNameEn: string;
    journalId: number|undefined;
    voucherKindId: number;
    serialTypeId: number;
    serialId: number | undefined;
    defaultAccountId: number|undefined;
    defaultCurrencyId: number|undefined;
    createFinancialEntryId: number|undefined;
    defaultBeneficiaryId:number|undefined;
    printAfterSave:boolean;
  

}