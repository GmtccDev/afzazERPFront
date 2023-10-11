export class ResponseResult<T>{
    message!:string;
    success!:Boolean;
    data!:T | null;
    isFound:boolean = false;
}


export class ResponseData{
    message!:string;
    success!:Boolean;
}

export class ResponseResultNoraml{
    message!:string;
    success!:Boolean;
    
    isFound:boolean = false;
    isUsed:boolean = false;
}

