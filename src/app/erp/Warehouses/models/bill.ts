import { BillDynamicDeterminantDto, DeterminantDataDto, InsertBillDynamicDeterminant } from "./bill-dynamic-determinant";

export class Bill {
    id: number;
    code: string;
    companyId: number;
    branchId: number;
    billTypeId: number;
    fiscalPeriodId: number|undefined;
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
    currencyValue: number | undefined;
    projectId: number | undefined;
    costCenterId: number;
    notes: string | undefined;
    attachment: string | undefined;
    cashAccountId: number | undefined;
   // supplierAccountId: number | undefined;
    salesAccountId: number | undefined;
    salesReturnAccountId: number | undefined;
    purchasesAccountId: number | undefined;
    purchasesReturnAccountId: number | undefined;
   // discountAccountId: number | undefined;
    taxAccountId: number | undefined;
    totalBeforeTax: number;
    total: number;
    taxRatio: number | undefined;
    taxValue: number | undefined;
    net: number;
    netAfterTax: number;
    paid: number | undefined;
    paidAccountId: number | undefined;
    remaining: number;
    remainingAccountId: number | undefined;
    billItems: BillItem[] = [];
    billAdditionAndDiscounts: BillAdditionAndDiscount[] = [];



}
export class BillItem {
    id: number;
    billId: number;
    itemId: number;
    itemDescription: string | undefined;
    unitId: number | undefined;
    unitTransactionFactor: number | undefined;
    quantity: number;
    totalQuantity: number| undefined;
    price: number;
    totalBeforeTax: number;
    additionRatio: number | undefined;
    additionValue: number | undefined;
    discountRatio: number | undefined;
    discountValue: number | undefined;
    totalTax: number | undefined;
    total: number;
    storeId: number | undefined;
    costCenterId: number | undefined;
    totalCostPrice: number | undefined;
    notes: string | undefined;
    itemName:string;
    unitName:string;
    storeName:string;
    costCenterName:string;
    billItemTaxes: BillItemTax[] = [];
    billDynamicDeterminants:InsertBillDynamicDeterminant [] = []||undefined;

}
export class BillItemTax {
    id: number;
    billItemId: number;
    name: string | undefined;
    taxId: number;
    taxRatio: number;
    taxValue: number;
    subTaxCode: string | undefined;
    subTaxReason: string | undefined;


    



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
    currencyValue:number | undefined;
    accountName:string|undefined;
    correspondingAccountName:string|undefined;
    currencyName:string|undefined;



}
export class BillPayment
{
    id: number;
    code: string;
    billTypeId: number;
    billTypeNameAr:string | undefined;
    billTypeNameEn:string | undefined;
    date: any;
    supplierId: number | undefined;
    customerId: number | undefined;
    currencyId: number;
    currencyValue: number | undefined;
    net: number;
    netAfterTax: number;
    paid: number | undefined;
    remaining: number;
}
