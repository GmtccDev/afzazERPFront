export class TaxMaster {
    id: number;
    companyId: number;
    branchId: number;
   // subTaxCode:any;
    code: string;
    nameAr: string;
    nameEn: string | undefined;
    accountId:string;
    isActive:boolean;
    taxDetail:TaxDetail[]=[];
    subTaxDetail:SubTaxDetail[]=[];


}
export class TaxDetail {
    id: number;
    taxId: number; 
    fromDate: any;
    toDate: any | undefined;
    taxRatio:number;

}
export class SubTaxDetail {
    id: number;
    taxId: number; 
    code:any;
    subTaxNameAr: any;
    subTaxNameEn: any;
 

}
export class SubTaxReasonsDetail {
    id: number;
    subTaxId: number; 
    code:any;
    taxReasonAr: any;
    taxReasonEn: any;
 
}

export class SubTaxRatioDetail {
    id: number;
    subTaxId: number; 
    fromDate: any;
    toDate: any | undefined;
    taxRatio:number;


}