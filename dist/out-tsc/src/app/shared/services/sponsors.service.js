import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
let SponsorsService = /** @class */ (() => {
    let SponsorsService = class SponsorsService {
        constructor(http) {
            this.http = http;
        }
        sendEnquiryDetails(body) {
            return this.http.post('events/enquiry/', body);
        }
    };
    SponsorsService = __decorate([
        Injectable({
            providedIn: 'root'
        })
    ], SponsorsService);
    return SponsorsService;
})();
export { SponsorsService };
//# sourceMappingURL=sponsors.service.js.map