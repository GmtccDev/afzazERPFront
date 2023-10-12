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
    tax: number | undefined;
    discount: number | undefined;
    discountAccountId: number | undefined;
    net: number | undefined;
    paid: number | undefined;
    paidAccountId: number | undefined;
    remaining: number | undefined;
    remainingAccountId: number | undefined;
    billItem: BillItem[] = [];


}
export class BillItem {
    id: number;
    billId: number;
    itemId: number;
    unitId: number | undefined;
    quantity: number;
    price: number;
    totalBeforeTax: number | undefined;
    taxRatio: number | undefined;
    taxValue: number | undefined;
    discountRatio: number | undefined;
    discountValue: number | undefined;
    total: number | undefined;
    notes: string | undefined;
    itemNameAr:string;
    itemNameEn:string;
    unitNameAr:string;
    unitNameEn:string;



}