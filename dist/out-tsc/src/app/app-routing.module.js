import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
const routes = [
    { path: '', pathMatch: 'full', redirectTo: 'home' },
    {
        path: 'auth', loadChildren: './auth/auth.module#AuthModule'
    },
    {
        path: 'home',
        loadChildren: './home/home.module#HomeModule'
    }
];
let AppRoutingModule = /** @class */ (() => {
    let AppRoutingModule = class AppRoutingModule {
    };
    AppRoutingModule = __decorate([
        NgModule({
            imports: [RouterModule.forRoot(routes)],
            exports: [RouterModule]
        })
    ], AppRoutingModule);
    return AppRoutingModule;
})();
export { AppRoutingModule };
//# sourceMappingURL=app-routing.module.js.map