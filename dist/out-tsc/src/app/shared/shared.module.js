import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { SharedRoutingModule } from './shared-routing.module';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { NumberOnlyDirective } from './customDirectives/number-only.directive';
let SharedModule = /** @class */ (() => {
    let SharedModule = class SharedModule {
    };
    SharedModule = __decorate([
        NgModule({
            declarations: [NumberOnlyDirective],
            imports: [
                CommonModule,
                SharedRoutingModule,
                ReactiveFormsModule,
                FormsModule,
                DeviceDetectorModule.forRoot(),
            ],
            providers: [],
            exports: [
                DeviceDetectorModule,
                NumberOnlyDirective
            ]
        })
    ], SharedModule);
    return SharedModule;
})();
export { SharedModule };
//# sourceMappingURL=shared.module.js.map