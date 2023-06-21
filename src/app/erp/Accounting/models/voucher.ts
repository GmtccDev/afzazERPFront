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
    voucherDetail:VoucherDetail[]=[];


}
export class VoucherDetail {
    id: number;
    voucherId: number; 
    debit: number;
    credit: number;
    currencyId: number;
    currencyConversionFactor: number|undefined;
    debitLocal: number|undefined;
    creditLocal: number | undefined;
    beneficiaryTypeId: number;
    beneficiaryAccountId: number;
    description: string;
    costCenterId:number|undefined;
    currencyNameAr:string;
    currencyNameEn:string;
    beneficiaryAccountNameAr:string;
    beneficiaryAccountNameEn:string;
    costCenterNameAr:string;
    costCenterNameEn:string;


  

}