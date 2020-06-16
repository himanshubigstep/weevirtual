import { __decorate } from "tslib";
import { Directive } from '@angular/core';
let ScrollToBottomDirective = /** @class */ (() => {
    let ScrollToBottomDirective = class ScrollToBottomDirective {
        constructor(_el) {
            this._el = _el;
        }
        // public ngAfterViewInit() {
        //   const el: HTMLDivElement = this._el.nativeElement;
        //   // Does not work as scrollHeight === offsetHeight
        //   el.scrollTop = Math.max(0, el.scrollHeight - el.offsetHeight);
        //   // This work but we see scroll moving
        //   setTimeout(() => el.scrollTop = Math.max(0, el.scrollHeight - el.offsetHeight));
        // }
        // public ngOnInit() {
        //   const el: HTMLDivElement = this._el.nativeElement;
        //   // Does not work as scrollHeight === offsetHeight
        //   el.scrollTop = Math.max(0, el.scrollHeight - el.offsetHeight);
        //   // This work but we see scroll moving
        //   setTimeout(() => el.scrollTop = Math.max(0, el.scrollHeight - el.offsetHeight));
        // }
        scrollToBottom() {
            const el = this._el.nativeElement;
            el.scrollTop = Math.max(0, el.scrollHeight - el.offsetHeight);
        }
    };
    ScrollToBottomDirective = __decorate([
        Directive({
            selector: '[scroll-to-bottom]'
        })
    ], ScrollToBottomDirective);
    return ScrollToBottomDirective;
})();
export { ScrollToBottomDirective };
//# sourceMappingURL=scroll-to-bottom.directive.js.map