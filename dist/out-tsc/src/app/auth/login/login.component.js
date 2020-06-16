import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
let LoginComponent = /** @class */ (() => {
    let LoginComponent = class LoginComponent {
        constructor(formBuilder, authService, router, eventService, title, meta) {
            this.formBuilder = formBuilder;
            this.authService = authService;
            this.router = router;
            this.eventService = eventService;
            this.title = title;
            this.meta = meta;
            this.tokenStatus = false;
            this.errorStatus = false;
            this.submitted = false;
            this.number = null;
            this.clickOnContinue = false;
        }
        ngOnInit() {
            localStorage.setItem('reload', 'true');
            if (localStorage.getItem('token') && localStorage.getItem('details')) {
                this.tokenStatus = true;
                this.eventService.eventDetailsUpdate();
                this.router.navigate(['/home/lounge']);
            }
            else {
                if (localStorage.getItem('usernumber') && localStorage.getItem('refresh')) {
                    this.number = localStorage.getItem('usernumber');
                    localStorage.removeItem('refresh');
                }
                this.loginForm = this.formBuilder.group({
                    number: [this.number, [Validators.required, Validators.pattern('^([+][9][1]|[9][1]|[0]){0,1}([6-9]{1})([0-9]{9})$')]]
                });
                // }
            }
            // SEO Meta Tags
            this.title.setTitle('Log-in | Leaders Of Tomorrow - Season 8 | Largest Entrepreneurship Platform | ET NOW');
            this.meta.addTags([
                { name: 'description', content: 'Log in to Session on Technology And Innovation for Sustainability. Leaders Of Tomorrow - Season 8 By ET NOW India’s largest entrepreneurship platform' },
                { name: 'keywords', content: 'Log in, Largest Entrepreneurship Platform, ET NOW, Leaders Of Tomorrow Season 8' }
            ]);
        }
        get loginform() { return this.loginForm.controls; }
        onSubmit() {
            this.submitted = true;
            if (this.loginForm.valid) {
                this.clickOnContinue = true;
                this.authService.login(this.loginForm.value.number).subscribe(response => {
                    console.log(response);
                    let res = response;
                    localStorage.setItem('usernumber', this.loginForm.value.number);
                    this.router.navigate(['/auth/verify', res.id, 'login']);
                }, (error => {
                    this.clickOnContinue = false;
                    this.errorStatus = true;
                }));
            }
        }
        navigatetoregister() {
            this.router.navigate(['/auth']);
        }
    };
    LoginComponent = __decorate([
        Component({
            selector: 'app-login',
            templateUrl: './login.component.html',
            styleUrls: ['./login.component.scss']
        })
    ], LoginComponent);
    return LoginComponent;
})();
export { LoginComponent };
//# sourceMappingURL=login.component.js.map