export class WarehousesTaxesMaster {
    id: number;
    code: string;
    nameAr: string;
    nameEn: string | undefined;
    accountId:string;
    isActive:boolean;
    warehousesTaxesDetail:WarehousesTaxesDetail[]=[];


}
export class WarehousesTaxesDetail {
    id: number;
    warehousesTaxId: number; 
    fromDate: any;
    toDate: any | undefined;
    taxRatio:number;

}