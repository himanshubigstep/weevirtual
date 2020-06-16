import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
let EventService = /** @class */ (() => {
    let EventService = class EventService {
        constructor(router, httpService) {
            this.router = router;
            this.httpService = httpService;
            this.event_details_sub = new BehaviorSubject(null); //-----------Subject variables
            this.event_details = [];
            this.timerObj = {};
            this.getPanellistByEventIdApi = 'events/panellist-list/';
        }
        get eventDetails_Update() {
            if (localStorage.getItem('details')) {
                this.event_details = JSON.parse(localStorage.getItem('details'));
                this.event_details_sub.next(this.event_details);
            }
            return this.event_details_sub.asObservable();
        }
        getEventDetails() {
            return JSON.parse(localStorage.getItem('details'));
            ;
        }
        eventDetailsUpdate() {
            if (localStorage.getItem('details')) {
                this.event_details = JSON.parse(localStorage.getItem('details'));
                this.event_details_sub.next(this.event_details);
            }
            this.event_details_sub.next(this.event_details);
        }
        timer() {
            let Days;
            let start = "2020-05-29";
            let end = "2020-05-06";
            let present_Date = new Date;
            let present_time;
            let date = new Date;
            let lastDayofthemonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            let present_month = present_Date.getMonth();
            let present_day = present_Date.getDate();
            let monthStart = start.slice(5, 7);
            let dayStart = start.slice(8, 10);
            if (Number(monthStart) == present_month + 1) {
                Days = Number(dayStart) - present_day;
            }
            else {
                let daysofpresentmonth = lastDayofthemonth.getDate() - present_day;
                Days = Number(daysofpresentmonth) + Number(dayStart);
            }
            this.timerObj = { days: Days - 1, hours: 24 - present_Date.getHours(), mins: 60 - present_Date.getMinutes(), secs: 60 - present_Date.getSeconds() };
            return this.timerObj;
        }
        getVedioStreaminStatus(usertype, eventId) {
            let body = {
                user_type: usertype,
                event_id: eventId
            };
            return this.httpService.post('/events/video-stream-status/', body);
        }
        getPanellistByEventId(obj) {
            return this.httpService.post(this.getPanellistByEventIdApi, obj).toPromise();
        }
    };
    EventService = __decorate([
        Injectable({
            providedIn: 'root'
        })
    ], EventService);
    return EventService;
})();
export { EventService };
//# sourceMappingURL=event.service.js.map