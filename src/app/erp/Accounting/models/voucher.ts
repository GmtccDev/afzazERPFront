export class Voucher {
    id: number;
    companyId: number; 
    branchId: number;
    voucherTypeId: number;
    code: string;
    voucherDate: any;
    cashAccountId: number;
    costCenterAccountId: number | undefined;
    currencyId: number;
    description: string;
    voucherTotal: number;
    voucherDetail:VoucherDetail[]=[];


}
export class VoucherDetail {
    id: number;
    voucherId: number; 
    debit: number;
    credit: number;
    currencyId: number;
    currencyConversionFactor: number|undefined;
    debitAfterConversion: number|undefined;
    creditAfterConversion: number | undefined;
    beneficiaryTypeId: number;
    beneficiaryAccountId: number;
    description: string;
    costCenterAccountId:number|undefined;
    currencyNameAr:string;
    currencyNameEn:string;
    beneficiaryAccountNameAr:string;
    beneficiaryAccountNameEn:string;
    costCenterAccountNameAr:string;
    costCenterAccountNameEn:string;


  

}