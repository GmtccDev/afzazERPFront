export class Voucher {
    id: number;
    companyId: number; 
    branchId: number;
    voucherTypeId: number;
    code: string;
    voucherDate: any;
    cashAccountId: number;
    costCenterId: number | undefined;
    currencyId: number;
    description: string;
    voucherTotal: number;
    voucherTotalLocal: number;
    currencyFactor: number;
    //isGenerateEntry: boolean|undefined;
    fiscalPeriodId: number;

    voucherDetail:VoucherDetail[]=[];


}
export class VoucherDetail {
    id: number;
    voucherId: number; 
    beneficiaryTypeId: number;
    beneficiaryId: number;
    beneficiaryAccountId: number;
    debit: number;
    credit: number;
    currencyId: number;
    currencyConversionFactor: number|undefined;
    debitLocal: number|undefined;
    creditLocal: number | undefined;
    description: string;
    costCenterId:number|undefined;
    currencyName:string;
    beneficiaryName:string;
    costCenterName:string;


  

}