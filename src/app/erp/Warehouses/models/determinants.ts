export class DeterminantsMaster {
    id: number;
    code: string;
    nameAr: string;
    nameEn: string;
    valueType:any;
    status:boolean;
    determinantsDetails:DeterminantsDetail[]=[];


}
export class DeterminantsDetail {
  
    id: number;
    nameAr: string;
    nameEn: string;
    determinantsMasterId:number;
}