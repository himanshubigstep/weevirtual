import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
let SponsorsComponent = /** @class */ (() => {
    let SponsorsComponent = class SponsorsComponent {
        constructor(formBuilder) {
            this.formBuilder = formBuilder;
            this.intrests = ['lorem', 'ipsum', 'dollar'];
        }
        ngOnInit() {
            this.loadForm();
        }
        loadForm() {
            this.contactForm = this.formBuilder.group({
                user_name: [null, [Validators.required]],
                user_email: [null, [Validators.required]],
                user_mobile: [null, [Validators.required]],
                user_city: ['', [Validators.required]],
            });
        }
        onSubmit() {
            console.log(this.contactForm.value);
        }
    };
    SponsorsComponent = __decorate([
        Component({
            selector: 'app-sponsors',
            templateUrl: './sponsors.component.html',
            styleUrls: ['./sponsors.component.scss']
        })
    ], SponsorsComponent);
    return SponsorsComponent;
})();
export { SponsorsComponent };
//# sourceMappingURL=sponsors.component.js.map