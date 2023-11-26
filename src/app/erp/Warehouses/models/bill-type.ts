export class BillType {
    id: number;
    companyId: number;
    branchId: number;
    kind: number;
    nameAr: string;
    nameEn: string | undefined;
    warehouseEffect: number;
    affectOnCostPrice: boolean | undefined;
    accountingEffect: number;
    postingToAccountsAutomatically: boolean | undefined;
    codingPolicy: number;
    confirmCostCenter: boolean | undefined;
    confirmAnalyticalCode: boolean | undefined;
    calculatingTax: boolean | undefined;
    calculatingTaxOnPriceAfterDeductionAndAddition: boolean | undefined;
    calculatingTaxManual: boolean | undefined;
    manuallyTaxType: number | undefined;
    discountAffectsCostPrice: boolean | undefined;
    additionAffectsCostPrice: boolean | undefined;
    taxAffectsCostPrice: boolean | undefined;
    defaultCurrencyId: number | undefined;
    defaultUnitId: number | undefined;
    storeId: number | undefined;
    costCenterId: number | undefined;
    paymentMethodId: number | undefined;
    salesPersonId: number | undefined;
    projectId: number | undefined;
    defaultPrice: number | undefined;
    printImmediatelyAfterAddition: boolean | undefined;
    printExpiryDates: boolean | undefined;
    printItemsSpecifiers: boolean | undefined;
    printItemsImages: boolean | undefined;


}