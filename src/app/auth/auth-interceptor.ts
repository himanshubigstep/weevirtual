import { Injectable } from "@angular/core";
import {
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpEvent,
    HttpErrorResponse,
    HttpResponse
} from "@angular/common/http";
import { ErrorDialogServiceService } from "../shared/services/error-dialog-service.service";
import { throwError, Observable } from "rxjs";
import { map, catchError } from "rxjs/operators";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private errorDialogService: ErrorDialogServiceService) { }
    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        const token: string = localStorage.getItem("token");
        // --------------------------------------------------------------------------------------------------------------------
        // Append token for every request
        // --------------------------------------------------------------------------------------------------------------------
        if (token) {
            request = request.clone({
                headers: request.headers.set("Authorization", "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhaSI6ImdBQUFBQUJlN0lxdVJjaTYxVDZXRUFBbWxqVm40elNDVFdDQmF0cGhNT0diS2VSVmJWa3FORHBfQ2V0ZmdmZW1YLTlPaVNJcDl4Mm1oandDakVoaDVjUVQxZ0JqaWItZHpBPT0iLCJiaSI6ImdBQUFBQUJlN0lxdXlGUWh3UDVCdUpTN3VaZVF4ZXdCM2RIX1k2dWNuQ3N1MkZrNVgtdXdiT2w4WGczUy1adElqVUhhVndyajdMeUNXLTFZbER5WlpIbVVCd3Z2R21QU3lRPT0ifQ.4RiFgTjjMKrgWF3gQOypOvcrlpoJEwvlRkamjoq4dOo")
            });
        }

        request = request.clone({
            headers: request.headers.set("Accept", "application/json")
        });

        return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                }
                return event;
            }),
            catchError((error: HttpErrorResponse) => {
                let data = {};
                data = {
                    reason: error && error.error.reason ? error.error.reason : "",
                    status: error.status
                };
                this.errorDialogService.openDialog(data);
                return throwError(error);
            })
        );
    }
}
