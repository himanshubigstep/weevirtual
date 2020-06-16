import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { AuthComponent } from './auth/auth.component';
import { VerifyRegistrationComponent } from './verify-registration/verify-registration.component';
import { LoginComponent } from './login/login.component';
const routes = [
    {
        path: '', component: AuthComponent,
        children: [{
                path: '', component: RegisterComponent
            },
            { path: 'verify/:user_id/:type', component: VerifyRegistrationComponent },
            { path: 'verify/:user_id/:type/:url', component: VerifyRegistrationComponent },
            { path: 'login', component: LoginComponent }
        ]
    }
];
let AuthRoutingModule = /** @class */ (() => {
    let AuthRoutingModule = class AuthRoutingModule {
    };
    AuthRoutingModule = __decorate([
        NgModule({
            imports: [RouterModule.forChild(routes)],
            exports: [RouterModule]
        })
    ], AuthRoutingModule);
    return AuthRoutingModule;
})();
export { AuthRoutingModule };
//# sourceMappingURL=auth-routing.module.js.map