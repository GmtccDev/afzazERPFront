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
  CarriedOver = 1,
  NotCarriedOver = 2,
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
  Double = 4,
  Employee = 5,
  Other = 6
}
export enum AccountClassificationsArEnum {
  نقدية = 1,
  مورد = 2,
  عميل = 3,
  مزدوج = 4,
  موظف = 5,
  أخرى = 6
}
