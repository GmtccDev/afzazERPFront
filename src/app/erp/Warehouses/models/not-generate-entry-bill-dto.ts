export class NotGenerateEntryBillDto {
    id: number | null;
    branchId: number | null;
    companyId: number | null;
    code: string | null;
    billTypeAr: string | null;
    billTypeEn: string | null;
    totalBeforeTax: number | null;
    billDate:any;
    total: number | null;
    net: number | null;
    paid: number | null;
    remaining: number | null;
    fiscalPeriodId: number | null;
    billTypeId: number | null;
    isGenerateEntry: boolean | null;
    accountingEffect: number | null;
    billKindId: number | null;
    billKindEn: string | null;
    billKindAr: string | null;
}