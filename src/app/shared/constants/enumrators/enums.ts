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

export enum UserTypeEnum {
  Owner = 1,
  Tenant = 2,
  Purchaser = 3,
  'Opportunities Holders' = 4,
  Vendor = 5,
  Office = 6,
}

export enum RegisterationTypeEnum {
  Person = 1,
  Organization = 2,
}

export enum propertyType {
  Residential = 1,
  Commercial = 2,
  'Residential Commercial' = 3,
}

export enum buildingType {
  Building = 1,
  Villa = 2,
}

export enum accountType {
  DeferredRevenue = 1,
  AccuredRevenue = 2,
  Tax = 3,
  Insurance = 4,
  Service = 5,
  Revenue = 6,
  Tenant = 7,
}
export enum delegationType {
  'Authorized Delegation' = 1,
  'Legitimate Agent' = 2,
}

export enum pursposeType {
  ForRent = 1,
  ForSell = 2,
}
export enum realEstateTypesEnum {
  MainRealEstateGroup = 1,
  SubRealEstateGroup = 2,
}
export enum commissionTypesEnum {
  value = 1,
  ratio = 2,
}

export enum AccountStateEnum {
  Main = 1,
  Sub = 2,
}
export enum AccountNatureEnum {
  Debit = 1,
  Credit = 2,
  Without = 3,
  Both = 4,
}

export enum CalendarTypesEnum {
  Gregorian = 1,
  Hijri = 2,
}
export enum PaymentMethodsEnum {
  Monthly = 1,
  Yearly = 2,
  Installments = 3,
  Daily = 4,
}
export enum RentPeriodTypeEnum {
  Month = 1,
  Year = 2,
  Day = 3,
}
export enum ContractMarketingTypeEnum {
  Marketed = 1,
  owner = 2,
}
export enum RentContractTypeEnum {
  'Contracts And Collections Management' = 1,
  Leasing = 2,
}
export enum PaymentDateEnum {
  'Start Contract Date' = 1,
  'End Contract Date' = 2,
}
export enum OfficAmountTypeEnum {
  Ratio = 1,
  Amount = 2,
}
export enum AnnualIncreaseInRentEnum {
  'on the basis' = 1,
  cumulative = 2,
}
export enum TenantRepresentativeEnum {
  TheTenantIsRepresentedByHimself = 1,
  TheTenantIsAnAgentUnderALegitimateAgency = 2,
}
export enum SubLeasingEnum {
  Allowed = 1,
  NotAllowed = 0,
}
export enum PaymentTimeTypesEnum {
  Month = 1,
  Year = 2,
}
export enum PaymentsMethodsInRentContractEnum {
  AmountsPayInMonth = 1,
  Quarterly = 2,
  MidTerm = 3,
  AmountsPayInYear = 4,
  AmountsPayForOnceTime = 5,
  FreeServices = 6,
  DeferredServices = 7,
}
export enum CalculateMethodsInRentContractEnum {
  Ratio = 1,
  Amount = 2,
  Number = 3,
}
export enum ContractUnitsServicesAccountsEnum {
  TenantAccount = 1,
  OwnerServicesAccount = 2,
  OfficeAccount = 3,
}
// status==0  ======> لم يتم تعميد العقد
// status==1  ======> تم التعميد العقد
// status==2  ======> اخلاء العقد
// status==3  ======> تم تسوية العقد
// status==4  ======> تم تعميد التسوية العقد
// status==5  ======> تم تجديد العقد
// status==6  ======> تم تعميد تجديد العقد
// status==7 ======> العقود المؤرشفة
// status==8 ======> العقود المنتهية
export enum RentContractStatusEnum {
  NotIssued = 0,
  Issued = 1,
  Evacuation = 2,
  Settlement = 3,
  IssueSettlement = 4,
  Renew = 5,
  IssueRenew = 6,
  Archieved = 7,
  Expired = 8,
}
export enum UnitStatusEnum {
  //  status==1  ======> الوحدة متاحة======================>   avialable
  //  status==2  ======> الوحدة محجوزة   ==================>   booked
  //  status==3  ======> الوحدة تحت التعاقد  ==============>   underContract
  //  status==4  ======> الوحدة مؤجرة======================>   rented
  //  status==5  ======> الوحدة تحت الإخلاء =================>   evacuation
  //  status==6  ======> الوحدة عليها عرض =================>   evacuation

  avialable = 1,
  booked = 2,
  underContract = 3,
  rented = 4,
  evacuation = 5,
  hasOffer = 6,
}
export enum RentContractDuesEnum {
  Rent = 1,
  Inssurance = 2,
  Tax = 3,
  Service = 4,
  ServiceTax = 5,
  Water = 6,
  Electricity = 7
}
export enum contractTypesEnum {
  Rent = 1,
  Sell = 2,
  Purchase = 3,
}
//#region Product Type
export enum productTypeEnum{
Warehouse=1,
Service=2
}
//#endregion
//#region Maintenance Request Type
export enum maintenanceRequestTypeEnum{
  Normal=1,
  Urgent=2
}

//#endregion

//#region Notificatons Manager
export enum NotificationsEvents {
  SendNow = 1,
  BeforeDuesDate = 2,
  BeforeEndContracts = 3,
}
//#endregion
//#region Notificatons Manager
export enum ToolbarActions {
  List = "List",
  Save = "Save",
  New = "New",
  Update = "Update",
  Delete = "Delete",
  Copy = "Copy",
  Print = "Print",
  Expory = "Expory",
  Reset="Reset",
  Cancel="Cancel"
}
//#endregion
//#region WhatsApp Providers
export enum WhatsAppProviders {
  Twilio = 1,
  Ultramsg = 2,

}
//#endregion


//#endregion
//#region WhatsApp Providers
export enum EntryTypes {
  reciveVoucher = 1,
  payVoucher = 2,
  debitNote = 3,
  creditNote=4

}
//#endregion

//#region WhatsApp Providers
export enum AlertTypes {
  success = "success",
  info = "info",
  error = "error",
  warning="warning"

}
//#endregion
//#region Technician Type Enum
export enum TechnicianTypeEnum{
  Internal=1,
  External=2
}

//#endregion

//#region ElectricityMeterTypeEnum
export enum ElectricityMeterTypeEnum{
  Services=1,
  Offices=2,
  AirConditions=3
}

//#endregion
