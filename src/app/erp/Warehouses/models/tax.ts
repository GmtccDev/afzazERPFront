export class TaxMaster {
    id: number;
    companyId: number;
    branchId: number;
    code: string;
    nameAr: string;
    nameEn: string | undefined;
    accountId:string;
    isActive:boolean;
    taxDetail:TaxDetail[]=[];


}
export class TaxDetail {
    id: number;
    taxId: number; 
    fromDate: any;
    toDate: any | undefined;
    taxRatio:number;

}