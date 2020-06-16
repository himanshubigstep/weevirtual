import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
const routes = [];
let SharedRoutingModule = /** @class */ (() => {
    let SharedRoutingModule = class SharedRoutingModule {
    };
    SharedRoutingModule = __decorate([
        NgModule({
            imports: [RouterModule.forChild(routes)],
            exports: [RouterModule]
        })
    ], SharedRoutingModule);
    return SharedRoutingModule;
})();
export { SharedRoutingModule };
//# sourceMappingURL=shared-routing.module.js.map