export class VoucherType {
    id: number;
    companyId: number; 
    branchId: number; 
    nameAr: string;
    nameEn: string;
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