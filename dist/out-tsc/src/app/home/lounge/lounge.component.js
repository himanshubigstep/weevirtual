import { __decorate } from "tslib";
import { Component, ViewChild } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';
let LoungeComponent = /** @class */ (() => {
    let LoungeComponent = class LoungeComponent {
        constructor(eventService, router, renderer, config, title, meta) {
            this.eventService = eventService;
            this.router = router;
            this.renderer = renderer;
            this.title = title;
            this.meta = meta;
            this.isMenuOpen = false;
            this.enableVideoStreaming = true;
            this.enableVideoJoiningButton = true;
            this.clickActive = true;
            this.month = ['Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
            ];
            this.dates = [];
            /* This events get called by all clicks on the page
             */
            // this.renderer.listen('window', 'click',(e:Event)=>{
            //     if(this.toggleButton.nativeElement.contains(e.target) && this.menu.nativeElement.contains(e.target)) {
            //         this.isMenuOpen=true;
            //     }
            //     else {
            //       this.isMenuOpen=false;
            //     }
            // });
            // customize default values of popovers used by this component tree
            config.placement = 'right';
            //config.triggers = 'hover';
        }
        ngOnInit() {
            this.timerObj = this.eventService.timer();
            this.timer();
            this.eventAllDetails = this.eventService.getEventDetails();
            this.eventService.eventDetails_Update.subscribe(response => {
                let res = response;
                console.log(response);
                this.eventAllDetails = this.eventService.getEventDetails();
                this.user_details = this.eventAllDetails.user_details;
                this.Name = this.user_details.name[0];
                this.fullName = this.user_details.name;
                this.event_details = this.eventAllDetails.event_details;
                this.event_details.schedule_details.forEach(webinar_details => {
                    let month = webinar_details.date.slice(3, 6);
                    let date = webinar_details.date.slice(0, 2);
                    this.dates.push({ name: webinar_details.name, month: month, date: date });
                });
                this.Schedule_Details = this.event_details.schedule_details[0];
                this.activeDate = this.dates[0].name;
                this.sponsors_details = this.eventAllDetails.sponsor_details;
                this.getVideoStatus();
            });
            this.videoModal();
            this.popOver();
            // SEO Meta Tags
            this.title.setTitle('Welcome | Leaders Of Tomorrow - Season 8 | Largest Entrepreneurship Platform | ET NOW');
            this.meta.addTags([
                { name: 'description', content: 'Welcome to Session On Technology and Innovation for Sustainability. Leaders of Tomorrow - Season 8, the most comprehensive enabling platform for small businesses.' }
            ]);
        }
        checkActiveClass() {
            return {
                sessionActive: true
            };
        }
        clickActiveClass(name) {
            console.log(name);
            this.activeDate = name;
            this.event_details.schedule_details.forEach(scedule => {
                if (name == scedule.name) {
                    this.Schedule_Details = scedule;
                }
            });
            this.clickActive = true;
        }
        navigateToMeetinHall() {
            clearInterval(this.getVideoStatusCheckTimer);
            this.router.navigate(['/home/meeting-hall']);
        }
        navigatetologin() {
            localStorage.clear();
            localStorage.setItem('reload', 'true');
            this.router.navigate(['/home']);
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
        navigatetoscedule() {
            this.router.navigate(['/home/schedule']);
        }
        navigatetoSponsors() {
            this.router.navigate(['/home/sponsors']);
        }
        // navigateToSponsonsors(sponsor) {
        //   this.router.navigate(['/home/sponsors/' + sponsor]);
        // }
        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen;
        }
        //Download
        downloadPdf() {
            let doc = [];
            pdfMake.vfs = pdfFonts.pdfMake.vfs;
            let docDefinition = {};
            pdfMake.createPdf(docDefinition).download('Organiser-details');
        }
        videoModal() {
            $('.modal').each(function () {
                var src = $(this).find('iframe').attr('src');
                $(this).on('click', function () {
                    $(this).find('iframe').attr('src', '');
                    $(this).find('iframe').attr('src', src);
                });
            });
        }
        popOver() {
            $().popover({ container: 'body' });
        }
        getVideoStatus() {
            this.getVideoStatusCheckTimer = setInterval(() => {
                this.eventService.getVedioStreaminStatus(this.user_details.user_type, this.user_details.event).subscribe(response => {
                    let res = response;
                    this.enableVideoStreaming = res.status;
                    if (this.enableVideoStreaming) {
                        clearInterval(this.getVideoStatusCheckTimer);
                    }
                });
            }, 1000);
        }
        OnDestroy() {
            clearInterval(this.getVideoStatusCheckTimer);
        }
    };
    __decorate([
        ViewChild('toggleButton')
    ], LoungeComponent.prototype, "toggleButton", void 0);
    __decorate([
        ViewChild('menu')
    ], LoungeComponent.prototype, "menu", void 0);
    LoungeComponent = __decorate([
        Component({
            selector: 'app-lounge',
            templateUrl: './lounge.component.html',
            styleUrls: ['./lounge.component.scss'],
            providers: [NgbPopoverConfig]
        })
    ], LoungeComponent);
    return LoungeComponent;
})();
export { LoungeComponent };
//# sourceMappingURL=lounge.component.js.map