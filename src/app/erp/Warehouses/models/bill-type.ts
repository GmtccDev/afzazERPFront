export class BillType {
    id: number;
    companyId: number;
    branchId: number;
    billKind: number;
    billNameAr: string;
    billNameEn: string | undefined;
    warehouseEffect: number;
    affectOnCostPrice: boolean | undefined;
    accountingEffect: number;
    postingToAccountsAutomatically: boolean | undefined;
    codingPolicy: number;
    confirmCostCenter: boolean | undefined;
    confirmAnalyticalCode: boolean | undefined;
    notCalculatingTax: boolean | undefined;
    calculatingValueAddedTaxAfterLuxuryTax: boolean | undefined;
    calculatingTaxOnPriceAfterDeductionAndAddition: boolean | undefined;
    calculatingTaxManual: boolean | undefined;
    manuallyTaxType: number | undefined;
    discountAffectsCostPrice: boolean | undefined;
    additionAffectsCostPrice: boolean | undefined;
    defaultCurrencyId: number | undefined;
    defaultUnitId: number | undefined;
    storeId: number | undefined;
    costCenterId: number | undefined;
    paymentMethodId: number | undefined;
    vendorId: number | undefined;
    projectId: number | undefined;
    defaultPrice: number | undefined;
    printImmediatelyAfterAddition: boolean | undefined;
    printExpiryDates: boolean | undefined;
    printItemsSpecifiers: boolean | undefined;
    printItemsImages: boolean | undefined;


}