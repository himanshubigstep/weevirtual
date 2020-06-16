import { __decorate } from "tslib";
import { Directive, HostListener } from "@angular/core";
let NumberOnlyDirective = /** @class */ (() => {
    let NumberOnlyDirective = class NumberOnlyDirective {
        constructor(_el) {
            this._el = _el;
        }
        onInputChange(event) {
            const initalValue = this._el.nativeElement.value;
            this._el.nativeElement.value = initalValue.replace(/[^0-9()+]/g, "");
            if (initalValue !== this._el.nativeElement.value) {
                event.stopPropagation();
            }
        }
    };
    __decorate([
        HostListener("input", ["$event"])
    ], NumberOnlyDirective.prototype, "onInputChange", null);
    NumberOnlyDirective = __decorate([
        Directive({
            selector: '[appNumberOnly]'
        })
    ], NumberOnlyDirective);
    return NumberOnlyDirective;
})();
export { NumberOnlyDirective };
//# sourceMappingURL=number-only.directive.js.map