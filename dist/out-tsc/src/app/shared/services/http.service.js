import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { environment } from "../../../environments/environment";
let HttpService = /** @class */ (() => {
    let HttpService = class HttpService {
        constructor(http) {
            this.http = http;
            this.baseURL = environment.baseURL;
        }
        get(endpoint) {
            return this.http.get(this.baseURL + endpoint);
        }
        post(endpoint, data) {
            return this.http.post(this.baseURL + endpoint, data);
        }
        put(endpoint, data) {
            return this.http.put(this.baseURL + endpoint, data);
        }
        delete(endpoint, data) {
            return this.http.delete(this.baseURL + endpoint, data);
        }
    };
    HttpService = __decorate([
        Injectable({
            providedIn: 'root'
        })
    ], HttpService);
    return HttpService;
})();
export { HttpService };
//# sourceMappingURL=http.service.js.map