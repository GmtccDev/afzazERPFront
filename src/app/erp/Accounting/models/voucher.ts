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
    voucherDetail: VoucherDetail[] = [];
  


}
export class SimpleVoucher {
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
    fiscalPeriodId: number;
    referenceId: number | undefined;
    referenceNo: number | undefined;
    paymentType: number | undefined;
    chequeNumber: string | undefined;
    chequeDate: any;
    chequeDueDate: any;
    invoicesNotes: string | undefined;
    salesPersonId: number | undefined;
    //projectId: number | undefined;

    voucherDetail: VoucherDetail[] = [];
    billPay: BillPay[] = [];
    billInstallmentPay: BillInstallmentPay[] = [];


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
    currencyConversionFactor: number | undefined;
    debitLocal: number | undefined;
    creditLocal: number | undefined;
    description: string;
    costCenterId: number | undefined;
    currencyName: string;
    beneficiaryName: string;
    costCenterName: string;

}
export class BillPay {
    id: number;
    voucherId: number;
    billId: number;
    net: number;
    return: number | undefined;
    paid: number;
    remaining: number;


}
export class BillInstallmentPay {
    id: number;
    voucherId: number;
    billId: number;
    billInstallmentId: number;
    net: number;
    paid: number;
    remaining: number;
    dueDate: any;



}