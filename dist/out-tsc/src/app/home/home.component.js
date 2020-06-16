import { __decorate, __param } from "tslib";
import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
let HomeComponent = /** @class */ (() => {
    let HomeComponent = class HomeComponent {
        constructor(router, eventService, authservice, platformId, title, meta) {
            this.router = router;
            this.eventService = eventService;
            this.authservice = authservice;
            this.platformId = platformId;
            this.title = title;
            this.meta = meta;
            this.enableVideoJoiningButton = false;
            this.link_param = '?ref_src=twsrc%5Etfw';
        }
        ngOnInit() {
            if (localStorage.getItem('reload')) {
                //window.location.href = 'http://localhost:4200';
                window.location.reload();
                localStorage.removeItem('reload');
            }
            this.twitter_link = 'https://twitter.com/tantraaevents' + this.link_param;
            this.timerObj = this.eventService.timer();
            this.timer();
            // SEO Meta Tags
            this.title.setTitle('Leaders Of Tomorrow - Season 8 | Largest Entrepreneurship Platform | ET NOW');
            this.meta.addTags([
                { name: 'description', content: 'Session On Technology And Innovation For Sustainability. Leaders Of Tomorrow - Season 8 By ET NOW On Friday 29th May Evening 6 PM to 8.30 PM. Register NOW For The Wonderful Session By Largest Entrepreneurship Platform.' },
                { name: 'keywords', content: 'Largest Entrepreneurship Platform by ET NOW, ET NOW, Leaders Of Tomorrow Season 8' }
            ]);
        }
        ngAfterViewInit() {
            console.log('after view init called');
            if (isPlatformBrowser(this.platformId)) {
                setTimeout(function () {
                    window.twttr = (function (d, s, id) {
                        let js, fjs = d.getElementsByTagName(s)[0], t = window.twttr || {};
                        if (d.getElementById(id))
                            return t;
                        js = d.createElement(s);
                        js.id = id;
                        js.src = 'https://platform.twitter.com/widgets.js';
                        fjs.parentNode.insertBefore(js, fjs);
                        t._e = [];
                        t.ready = function (f) {
                            t._e.push(f);
                        };
                        return t;
                    }(document, 'script', 'twitter-wjs'));
                    window.twttr.widgets.load();
                }, 1000);
            } //  end of ngAfterviewinit
        }
        timer() {
            console.log(this.timerObj);
            this.days = this.timerObj.days;
            this.hours = this.timerObj.hours;
            this.secs = this.timerObj.secs;
            this.mins = this.timerObj.mins;
            if (this.days >= 0) {
                this.interval = setInterval(() => {
                    if (this.secs > 0) {
                        this.secs--;
                    }
                    else {
                        if (this.mins > 0) {
                            this.mins--;
                        }
                        else {
                            if (this.hours < 24) {
                                this.hours--;
                            }
                            else {
                                if (this.days > 0) {
                                    this.days--;
                                }
                                this.hours = 24;
                            }
                            this.mins = 60;
                        }
                        this.secs = 60;
                    }
                }, 1000);
            }
            else {
                this.enableVideoJoiningButton = true;
            }
        }
        navigatetorequestaccess() {
            this.router.navigate(["/auth"]);
        }
        scroll(el) {
            const pos = el.style.position;
            const top = el.style.top;
            el.style.position = 'relative';
            el.style.top = '-82px';
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            el.style.top = top;
            el.style.position = pos;
        }
        navigatetologin() {
            this.router.navigate(['/auth/login']); //
        }
    };
    HomeComponent = __decorate([
        Component({
            selector: 'app-home',
            templateUrl: './home.component.html',
            styleUrls: ['./home.component.scss']
        }),
        __param(3, Inject(PLATFORM_ID))
    ], HomeComponent);
    return HomeComponent;
})();
export { HomeComponent };
//# sourceMappingURL=home.component.js.map