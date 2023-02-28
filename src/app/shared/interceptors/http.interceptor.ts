import { Injectable, ErrorHandler } from "@angular/core";
import {
    HttpResponse,
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpHeaders,
    HttpErrorResponse,
} from "@angular/common/http";
import { Observable, Subject, of, BehaviorSubject } from "rxjs";
import { filter, take, switchMap, finalize } from "rxjs/operators";
import { Router } from "@angular/router";
import { IStatusResultResponse } from "../base/base.models";
import { UserService } from "../common-services/user.service";
import { blobToText } from "../base/base";
import { NotificationService } from "../common-services/notification.service";


@Injectable({
    providedIn: 'root'
})
export class ResortHttpInterceptor implements HttpInterceptor {
    requestCount = 0;
    // showerror: boolean = false;
    constructor(
        private userService: UserService,
        private router: Router,
        private notificationService: NotificationService
    ) { }


    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        let interceptObservable = new Subject<HttpEvent<any>>();
        let modifiedRequest = this.normalizeRequestHeaders(request);
        //Loader Show
        this.requestCount++;
        //   this.loaderService.show();
        next.handle(modifiedRequest)
            .pipe(
                finalize(() => {
                    this.requestCount--;
                })
            )
            .subscribe(
                (event: HttpEvent<any>) => {
                    
                    this.handleSuccessResponse(event, interceptObservable);
                },
                (error: any) => {

                    return this.handleErrorResponse(
                        error,
                        interceptObservable,
                        next,
                        modifiedRequest
                    ).subscribe((x) => {
                        //console.log(x)
                    });
                }
            );

        return interceptObservable;
    }

    private normalizeRequestHeaders(
        request: HttpRequest<any>
    ): HttpRequest<any> {

        let modifiedHeaders = new HttpHeaders();

        if (request.url.indexOf('i18n') === -1)
            modifiedHeaders = this.addAuthorizationHeaders(request.headers);

        return request.clone({
            headers: modifiedHeaders,
        });
    }
    private addAuthorizationHeaders(headers: HttpHeaders): HttpHeaders {

        let acceptLanguage = headers ? headers.getAll("Accept-Language") : null;
        let authorizationHeaders = headers
            ? headers.getAll("Authorization")
            : null;
        if (!authorizationHeaders) {
            authorizationHeaders = [];
        }
        headers = headers.set("Accept-Language", localStorage.getItem('language') || 'en');
        if (
            !this.itemExists(
                authorizationHeaders,
                (item: string) => item.indexOf("Bearer ") == 0
            )
        ) {
            let token = this.userService.getToken();
            //let token = localStorage.getItem(environment.authTokenKey); // Get the token from local storage here  this._tokenService.getToken();
            if (headers && token) {
                headers = headers.set("Authorization", "Bearer " + token);
            }
        }
        return headers;
    }
    private handleSuccessResponse(
        event: HttpEvent<any>,
        interceptObservable: Subject<HttpEvent<any>>
    ): void {
        let self = this;

        if (event instanceof HttpResponse) {
            
            if (
                event.body.message!=null &&   event.body.message!=""
                // event.body instanceof Blob &&
                // event.type &&
                // event.body.type.indexOf("application/json") >= 0
            ) {
                let clonedResponse = event.clone();
                let modifiedResponse= self.handleResponse(event)
                // blobToText(event.body).subscribe((json) => {
                //     const responseBody =
                //         json === "null" ? {} : JSON.parse(json);

                //     let modifiedResponse = self.handleResponse(
                //         event.clone({
                //             body: responseBody,
                //         })
                //     );

                    interceptObservable.next(
                        modifiedResponse.clone({
                            body: new Blob(
                                [JSON.stringify(modifiedResponse.body)],
                                { type: "application/json" }
                            ),
                        })
                    );
                    
                    interceptObservable.complete();
                //     // this.notificationService.success(event.statusText, 'Success');
                // });
            } else {
                interceptObservable.next(event);
                interceptObservable.complete();
            }
        } else {
            interceptObservable.next(event);
        }
    }
    private handleErrorResponse(
        error: any,
        interceptObservable: Subject<HttpEvent<any>>,
        next: HttpHandler,
        req: HttpRequest<any>
    ): Observable<any> {

        let errorObservable = new Subject<any>();
        if (!(error.error instanceof Blob)) {

            interceptObservable.error(error);
            if (error.error != null) {
                if (error.error.message != null || error.error.message != "") {
                    this.notificationService.error(error.error.message);
                }
                else {
                    this.notificationService.error("error in server");
                }
            }
            else {
                this.notificationService.error("error in server");
            }
            interceptObservable.complete();
            return of({});
        }

        if (error instanceof HttpErrorResponse && error.status === 401) {
            this.userService.logout();
        }
        blobToText(error.error).subscribe((json) => {
            const errorBody =
                json === "" || json === "null" ? {} : JSON.parse(json);
            const errorResponse = new HttpResponse({
                headers: error.headers,
                status: error.status,
                body: errorBody,
            });

            let ajaxResponse = this.getResortAjaxResponseOrNull(
                errorResponse
            );

            if (ajaxResponse != null) {
                this.handleResortResponse(
                    errorResponse,
                    ajaxResponse
                );
            } else {
                this.handleResortErrorResponse(errorResponse);
            }

            errorObservable.complete();
            interceptObservable.error(error);
            interceptObservable.complete();
        });
        return errorObservable;
    }
    private itemExists<T>(
        items: T[],
        predicate: (item: T) => boolean
    ): boolean {
        for (let i = 0; i < items.length; i++) {
            if (predicate(items[i])) {
                return true;
            }
        }

        return false;
    }
    private addAuthenticationToken(
        request: HttpRequest<any>
    ): HttpRequest<any> {
        // If we do not have a token yet then we should not set the header.
        // Here we could first retrieve the token from where we store it.
        let token = this.userService.getToken();
        if (!token) {
            return request;
        }

        return request.clone({
            headers: request.headers.set("Authorization", "Bearer " + token),
        });
    }
    private handleError(error: any): void {

    }
    private handleResponse(response: HttpResponse<any>): HttpResponse<any> {
        
        let ajaxResponse = this.getResortAjaxResponseOrNull(response);
        if (ajaxResponse == null) {
            return response;
        }
        return this.handleResortResponse(response, ajaxResponse);
    }
    private handleResortResponse(
        response: HttpResponse<any>,
        ajaxResponse: IStatusResultResponse
    ): HttpResponse<any> {

        let newResponse: HttpResponse<any>;
        
        if (ajaxResponse.status === "Success") {

            newResponse = response.clone({
                body: ajaxResponse.response,
            });
            if (ajaxResponse.message) {
                
                this.notificationService.success(
                    ajaxResponse.message,

                );
            }
        } else {

            newResponse = response.clone({
                body: ajaxResponse.response,
            });
            if (ajaxResponse.message) {


                if (ajaxResponse.exceptionMessage && ajaxResponse.exceptionMessage.includes('Object reference not set')) {
                    this.notificationService.error("error in server");
                }
                else if (ajaxResponse.exceptionMessage) {
                    this.notificationService.error(ajaxResponse.exceptionMessage);
                }

                else this.notificationService.error(ajaxResponse.message);

                if (ajaxResponse.status === 'Failure') {

                    this.handleError(ajaxResponse.message);
                    if (ajaxResponse.message.indexOf('not Active') > 0 || ajaxResponse.message === 'Invalid token pair') {
                        this.userService.logout();
                    }

                }

            }
        }
        if (ajaxResponse.status === "Failure") {

            if (ajaxResponse.response) {
                if (ajaxResponse.response.errors) {
                    for (var key in ajaxResponse.response.errors) {
                        if (ajaxResponse.response.errors.hasOwnProperty(key)) {
                            //console.log(key + " -> " + ajaxResponse.response.errors[key]);
                        }
                    }
                }
            }
        }
        return newResponse;
    }
    private handleResortErrorResponse(
        response: any
    ) {

        let newResponse: HttpResponse<any>;
        if (response) {
            if (response.status == 400) {

                if (response.body.status === "Failure") {

                    for (var key in response.body.response.errors) {
                        if (response.body.response.errors.hasOwnProperty(key)) {
                            this.notificationService.error(key.substring(key.indexOf(".")).replace('.', '') + ' : ' + response.body.response.errors[key]);
                        }
                    }
                    newResponse = response.clone({
                        body: response,
                    });
                }
            }
        }
        //   this.showerror = true;
    }
    private getResortAjaxResponseOrNull(
        response: HttpResponse<any>
    ): IStatusResultResponse | null {

        if (!response || !response.headers) {
            return null;
        }

        let contentType = response.headers.get("Content-Type");
        if (!contentType) {
            return null;
        }

        if (contentType.indexOf("application/json") < 0) {
            return null;
        }

        let responseObj = JSON.parse(JSON.stringify(response.body));

        return responseObj as IStatusResultResponse;
    }
}
