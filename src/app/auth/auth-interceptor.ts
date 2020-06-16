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
        // if (token) {
        //     request = request.clone({
        //         headers: request.headers.set("Authorization", "Bearer " + token)
        //     });
        // }

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
