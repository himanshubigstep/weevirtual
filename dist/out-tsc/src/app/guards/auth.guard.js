import { __decorate } from "tslib";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
let AuthGuard = /** @class */ (() => {
    let AuthGuard = class AuthGuard {
        constructor(router, http, authService) {
            this.router = router;
            this.http = http;
            this.authService = authService;
        }
        canActivate(route, state) {
            return this.authService.isLoggedIn.pipe(map((isLoggedIn) => {
                console.log("Entered Auth Guard");
                if (!isLoggedIn) {
                    this.router.navigate(["/auth"], {
                        queryParams: { returnUrl: state.url }
                    });
                    return false;
                }
                const currentUser = localStorage.getItem("currentUser");
                if (currentUser !== "") {
                    const currentUserDetails = JSON.parse(localStorage.getItem("currentUser"));
                    const isAccessable = true;
                    if (!isAccessable) {
                    }
                }
                return true;
            }));
        }
    };
    AuthGuard = __decorate([
        Injectable()
    ], AuthGuard);
    return AuthGuard;
})();
export { AuthGuard };
//# sourceMappingURL=auth.guard.js.map