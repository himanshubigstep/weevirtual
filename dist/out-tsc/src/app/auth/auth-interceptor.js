import { __decorate } from "tslib";
import { Injectable } from "@angular/core";
import { HttpResponse } from "@angular/common/http";
import { throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
let AuthInterceptor = /** @class */ (() => {
    let AuthInterceptor = class AuthInterceptor {
        constructor(errorDialogService) {
            this.errorDialogService = errorDialogService;
        }
        intercept(request, next) {
            const token = localStorage.getItem("token");
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
            return next.handle(request).pipe(map((event) => {
                if (event instanceof HttpResponse) {
                }
                return event;
            }), catchError((error) => {
                let data = {};
                data = {
                    reason: error && error.error.reason ? error.error.reason : "",
                    status: error.status
                };
                this.errorDialogService.openDialog(data);
                return throwError(error);
            }));
        }
    };
    AuthInterceptor = __decorate([
        Injectable()
    ], AuthInterceptor);
    return AuthInterceptor;
})();
export { AuthInterceptor };
//# sourceMappingURL=auth-interceptor.js.map