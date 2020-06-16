import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
let ErrorDialogServiceService = /** @class */ (() => {
    let ErrorDialogServiceService = class ErrorDialogServiceService {
        constructor() { }
        openDialog(data) {
            if (data.status == "500") {
                alert("Internal Server Error");
            }
        }
    };
    ErrorDialogServiceService = __decorate([
        Injectable({
            providedIn: 'root'
        })
    ], ErrorDialogServiceService);
    return ErrorDialogServiceService;
})();
export { ErrorDialogServiceService };
//# sourceMappingURL=error-dialog-service.service.js.map