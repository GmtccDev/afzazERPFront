export class ApiException extends Error {
    override message: string;
    status: number;
    response: string;
    headers: { [key: string]: any; };
    result: any;

    constructor(message: string, status: number, response: string, headers: { [key: string]: any; }, result: any) {
        super();

        this.message = message;
        this.status = status;
        this.response = response;
        this.headers = headers;
        this.result = result;
    }

    protected isApiException = true;

    static isApiException(obj: any): obj is ApiException {
        return obj.isApiException === true;
    }
}
export interface IStatusResultResponse {
    status: string;
    exceptionMessage?: string;
    message?: string;
    response?: any;
}

export interface ConfirmationDto {
    message: string,
    trueText: string,
    falseText: string
}

export interface IpolygonGeoJson {
	polyGeo: any,
	featureStyle: any,
	name: any,
	isActive: boolean
}