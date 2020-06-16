import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { RegisterComponent } from './register/register.component';
import { AuthComponent } from './auth/auth.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VerifyRegistrationComponent } from './verify-registration/verify-registration.component';
import { LoginComponent } from './login/login.component';
import { AngularOtpLibModule } from 'angular-otp-box';
let AuthModule = /** @class */ (() => {
    let AuthModule = class AuthModule {
    };
    AuthModule = __decorate([
        NgModule({
            declarations: [RegisterComponent, AuthComponent, VerifyRegistrationComponent, LoginComponent],
            imports: [
                CommonModule,
                AuthRoutingModule,
                SharedModule,
                FormsModule,
                ReactiveFormsModule,
                AngularOtpLibModule
            ]
        })
    ], AuthModule);
    return AuthModule;
})();
export { AuthModule };
//# sourceMappingURL=auth.module.js.map