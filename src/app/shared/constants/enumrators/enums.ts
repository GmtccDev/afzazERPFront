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
  Withdrawal = 2
}
export enum VoucherTypeArEnum {
  قبض = 1,
  صرف = 2
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
  Employee = 3,
  Account = 4
}
export enum BeneficiaryTypeArEnum {
  عميل = 1,
  مورد = 2,
  مؤظف = 3,
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
  Inventory = 9

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
  مخزون = 9
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
  'First Period Goods Bill'=5

}
export enum BillKindArEnum {
  'فاتورة مبيعات' = 1,
  'فاتورة مشتريات' = 2,
  'فاتورة مردودات مبيعات' = 3,
  'فاتورة مردودات مشتريات' = 4,
  'فاتورة بضاعة أول المدة'=5


}
export enum PayWayEnum {
  
   Cash = 1,
   Credit = 2,
   Installment  = 3

}
export enum PayWayArEnum {
  
  نقدي = 1,
  أجل = 2,
  تقسيط  = 3

}
export enum ShipMethodEnum {
  
  FOB = 1,
  EX_Work = 2,
  CF  = 3,
  CIF=4

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
   شهرية= 1,
   'ربع شهرية'= 2,
   "نصف سنوية"= 3 ,
   "سنوي"= 4,
}
export enum CommissionTypeEnum {
   Monthly= 1,
   Quarterly= 2,
  'semi annual'= 3 ,
   annualy = 4,
}
export enum calculationMethodsArEnum{
 'قيمة ثابتة '=1,
 'تحسب بناء على عمر التحصيل'= 2,

}
export enum calculationMethodsEnum{
  'Fix Amount'=1,
  'As per age of collection'= 2,
 
 }