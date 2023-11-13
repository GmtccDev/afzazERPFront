export class DeterminantsMaster {
    id: number;
    code: string;
    nameAr: string;
    nameEn: string;
    status:boolean;
    determinantsDetail:DeterminantsDetail[]=[];


}
export class DeterminantsDetail {
  
    id: number;
    nameAr: string;
    nameEn: string;
    determinantsMasterId:number;
}