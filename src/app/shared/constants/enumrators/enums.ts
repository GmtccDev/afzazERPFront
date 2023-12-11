import { ICustomEnum } from '../../interfaces/ICustom-enum';

export function convertEnumToArray(enumarator: any) {
  let map: ICustomEnum[] = [];

  for (var n in enumarator) {
    if (typeof enumarator[n] === 'number') {
      map.push({ id: <any>enumarator[n], name: n });
    }
  }

  return map;
}

export enum VoucherTypeEnum {
  Deposit = 1,
  Withdrawal = 2,
  'Simple Deposit'=3,
  'Simple Withdrawal'=4

}
export enum VoucherTypeArEnum {
  قبض = 1,
  صرف = 2,
  'قبض بسيط'=3,
  'صرف بسيط'=4

}

export enum SerialTypeEnum {
  Automatic = 1,
  Manual = 2
}
export enum SerialTypeArEnum {
  الى = 1,
  يدوى = 2
}
export enum CreateFinancialEntryEnum {
  'Not creating an entry' = 1,
  'Create the entry automatically' = 2,
  'The entry is not created automatically' = 3
}

export enum CreateFinancialEntryArEnum {
  'عدم انشاء قيد' = 1,
  'انشاء القيد تلقائيًا' = 2,
  'عدم انشاء القيد تلقائيا' = 3
}

export enum BeneficiaryTypeEnum {
  Client = 1,
  Supplier = 2,
  // Employee = 3,
  Account = 4
}
export enum BeneficiaryTypeArEnum {
  عميل = 1,
  مورد = 2,
  // مؤظف = 3,
  حساب = 4
}
export enum EntriesStatusEnum {
  'Carried Over' = 1,
  'Not Carried Over' = 2,
  All = 3
}
export enum EntriesStatusArEnum {
  مرحل = 1,
  'غير مرحل' = 2,
  الكل = 3
}
export enum EntryStatusEnum {
  Post = 1,
  'Not Post' = 2,

}
export enum EntryStatusArEnum {
  مرحل = 1,
  'غير مرحل' = 2,

}
export enum AccountClassificationsForIncomeStatementEnum {
  Revenue = 1,
  Expense = 2
}
export enum AccountClassificationsForIncomeStatementArEnum {
  ايراد = 1,
  مصروف = 2
}
export enum AccountClassificationsEnum {
  Cash = 1,
  Supplier = 2,
  Client = 3,
  Binary = 4,
  Employee = 5,
  Other = 6,
  Sales = 7,
  Purchases = 8,
  Inventory = 9,
  Bank = 10

}
export enum AccountClassificationsArEnum {
  نقدية = 1,
  مورد = 2,
  عميل = 3,
  مزدوج = 4,
  موظف = 5,
  أخرى = 6,
  مبيعات = 7,
  مشتريات = 8,
  مخزون = 9,
  بنك = 10
}
export enum ReportOptionsEnum {
  Quarterly = 1,
  Monthly = 2,
  'Semi Monthly' = 3,
  Weekly = 4,
  Daily = 5,
}
export enum ReportOptionsArEnum {
  'ربع سنوى' = 1,
  شهرى = 2,
  'نصف شهرى' = 3,
  أسبوعى = 4,
  يومى = 5,
}
export enum ItemTypeEnum {
  Warehouse = 1,
  Service = 2
}
export enum ItemTypeArEnum {
  مستودع = 1,
  خدمة = 2
}
export enum CostCalculateMethodsEnum {
  'Last purchase price' = 1,
  'Opening price' = 2,
  'Actual average' = 3,
  'the highest price' = 4
}
export enum CostCalculateMethodsArEnum {
  'آخر سعر شراء' = 1,
  'السعر الافتتاحي' = 2,
  'المتوسط الفعلي' = 3,
  'أعلى سعر' = 4
}
export enum LifeTimeTypeEnum {
  Day = 1,
  Month = 2,
  Year = 3

}
export enum LifeTimeTypeArEnum {
  يوم = 1,
  شهر = 2,
  سنة = 3

}
export enum WarrantyTypeEnum {
  Day = 1,
  Month = 2,
  Year = 3

}
export enum WarrantyTypeArEnum {
  يوم = 1,
  شهر = 2,
  سنة = 3

}
export enum BillKindEnum {

  'Sales Bill' = 1,
  'Purchases Bill' = 2,
  'Sales Returns Bill' = 3,
  'Purchases Returns Bill' = 4,
  'First Period Goods Bill' = 5

}
export enum BillKindArEnum {
  'فاتورة مبيعات' = 1,
  'فاتورة مشتريات' = 2,
  'فاتورة مردودات مبيعات' = 3,
  'فاتورة مردودات مشتريات' = 4,
  'فاتورة بضاعة أول المدة' = 5


}
export enum PayWayEnum {

  Cash = 1,
  Credit = 2,
  Installment = 3

}
export enum PayWayArEnum {

  نقدي = 1,
  أجل = 2,
  تقسيط = 3

}
export enum ShipMethodEnum {

  FOB = 1,
  EX_Work = 2,
  CF = 3,
  CIF = 4

}
export enum ShipKindEnum {

  All = 1,
  Part = 2

}
export enum ShipKindArEnum {

  كلى = 1,
  جزئي = 2

}
export enum CommissionTypeArEnum {
  شهرية = 1,
  'ربع شهرية' = 2,
  "نصف سنوية" = 3,
  "سنوي" = 4,
}
export enum CommissionTypeEnum {
  Monthly = 1,
  Quarterly = 2,
  'semi annual' = 3,
  annualy = 4,
}
export enum calculationMethodsArEnum {
  'قيمة ثابتة ' = 1,
  'تحسب بناء على عمر التحصيل' = 2,

}
export enum calculationMethodsEnum {
  'Fix Amount' = 1,
  'As per age of collection' = 2,

}
export enum GeneralConfigurationEnum {
  MainCurrency = 1,
  MultiCurrency = 2,
  JournalEntriesSerial = 3,
  FinancialEntryCycle = 4,
  ClosingAccount = 5,
  AccountReceivables = 6,
  AccountingPeriod = 7,
  AccountExchange = 8,
  FixedAssetsJournal = 1000,
  DeprecationJournalEntries = 1001,
  AssetsGroupSerial = 1002,
  AssetsGroupSerialFormat = 1003,
  AssetsSerial = 1004,
  AssetsSerialformat = 1005,
  DefaultJournal = 1006,
  ChequesJournal = 1007,
  IdleTime = 10001
}
export enum ManuallyTaxType {
  Net = 1,
  Total = 2

}
export enum DeterminantsValueTypesEnEnum {

  'Select of list' = 1,
  'Number' = 2,
  'Text' = 3,
  'Date' = 4,
  'Select Yes/No' = 5

}
export enum DeterminantsValueTypesArEnum {
  'اختار من القائمة' = 1,
  'رقم' = 2,
  'نص' = 3,
  'تاريخ' = 4,
  ' اختار نعم/لا' = 5


}
export enum ChequeStatusEnum {
  Registered = 0,
  EditRegistered = 1,
  Collected = 2,
  Rejected = 3,
  CancelCollected = 4,
  CancelRejected = 5
}
export enum EntryTypesEnum {
  'Normal Entry' = 1000,
  Voucher = 1,
  RegisterIncomingCheque = 2,
  CollectIncomingCheque = 8,
  RejectIncomingCheque = 9,
  RegisterIssuingCheque = 3,
  CollectIssuingCheque = 10,
  RejectIssuingCheque = 11,
  SalesBill = 4,
  SalesReturnBill = 5,
  PurchasesBill = 6,
  PurchasesReturnBill = 7,



}
export enum EntryTypesArEnum {
  'قيد عادى'=1000,
  سند = 1,
  'تسجيل شيك صادر' = 2,
  'تحصيل شيك صادر' = 8,
  'رفض شيك صادر' = 9,
  'تسجيل شيك وارد' = 3,
  'تحصيل شيك وارد' = 10,
  'رفض شيك وارد' = 11,
  'فاتورة مبيعات' = 4,
  'فاتورة مردودات مبيعات' = 5,
  'فاتورة مشتريات' = 6,
  'فاتورة مردودات مشتريات' = 7



}

export enum ModuleLocationEnEnum {
  Accounting = 1,
  Warehouses = 2
  



}
export enum ModuleLocationArEnum {
  محاسبة = 1,
  مستودعات = 2
}

export enum PaymentTypeEnEnum {

  Cash = 1,
  Check = 2,
  Span = 3

}
export enum PaymentTypArEnum {

  نقدي = 1,
  شيك = 2,
  شبكة = 3

}

