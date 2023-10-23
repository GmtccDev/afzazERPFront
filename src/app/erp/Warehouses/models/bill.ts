export class Bill {
    id: number;
    code: string;
    companyId: number;
    branchId: number;
    billTypeId: number;
    date: any;
    supplierId: number | undefined;
    supplierReference: string | undefined;
    customerId: number | undefined;
    payWay: number;
    shipMethod: number | undefined;
    shipKind: number | undefined;
    referenceId: number | undefined;
    referenceNo: number | undefined;
    salesPersonId: number | undefined;
    storeId: number | undefined;
    deliveryDate: any;
    currencyId: number;
    currencyExchangeTransaction: number | undefined;
    projectId: number | undefined;
    costCenterId: number;
    notes: string | undefined;
    attachment: string | undefined;
    cashAccountId: number | undefined;
    supplierAccountId: number | undefined;
    salesAccountId: number | undefined;
    salesReturnAccountId: number | undefined;
    purchasesAccountId: number | undefined;
    purchasesReturnAccountId: number | undefined;
    total: number | undefined;
    taxRatio: number | undefined;
    taxValue: number | undefined;

    // discount: number | undefined;
    // discountAccountId: number | undefined;
    net: number | undefined;
    paid: number | undefined;
    paidAccountId: number | undefined;
    remaining: number | undefined;
    remainingAccountId: number | undefined;
    billItem: BillItem[] = [];
    billAdditionAndDiscount: BillAdditionAndDiscount[] = [];



}
export class BillItem {
    id: number;
    billId: number;
    itemId: number;
    itemDescription: string | undefined;
    unitId: number | undefined;
    quantity: number;
    price: number;
    totalBeforeTax: number | undefined;
    additionRatio: number | undefined;
    additionValue: number | undefined;
    discountRatio: number | undefined;
    discountValue: number | undefined;
    total: number | undefined;
    storeId: number | undefined;
    notes: string | undefined;
    itemNameAr:string;
    itemNameEn:string;
    unitNameAr:string;
    unitNameEn:string;
    storeNameAr:string;
    storeNameEn:string;



}
export class BillAdditionAndDiscount {
    id: number;
    billId: number;
    additionRatio:number | undefined;
    additionValue:number | undefined;
    discountRatio:number | undefined;
    discountValue:number | undefined;
    accountId:string|undefined;
    notes:string|undefined;
    correspondingAccountId:string|undefined;
    currencyId:number | undefined;
    currencyExchangeTransaction:number | undefined;
    accountNameAr:string|undefined;
    accountNameEn:string|undefined;
    correspondingAccountNameAr:string|undefined;
    correspondingAccountNameEn:string|undefined;
    currencyNameAr:string|undefined;
    currencyNameEn:string|undefined;



}