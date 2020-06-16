import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { AuthGuard } from '../guards/auth.guard';
import { LoungeComponent } from './lounge/lounge.component';
import { MeetingHallComponent } from './meeting-hall/meeting-hall.component';
import { SpeakersPopoverComponent } from './speakers-popover/speakers-popover.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { SponsorsComponent } from '../sponsors/sponsors.component';
import { ZohoComponent } from './sponsors/zoho/zoho.component';
import { OddupComponent } from './sponsors/oddup/oddup.component';
import { WadhwaniComponent } from './sponsors/wadhwani/wadhwani.component';
import { MobileChatComponent } from './mobile-chat/mobile-chat.component';
const routes = [
    { path: '', component: HomeComponent },
    { path: 'lounge', component: LoungeComponent },
    { path: 'meeting-hall', component: MeetingHallComponent },
    { path: 'mobile-chat', component: MobileChatComponent },
    { path: 'speakers', component: SpeakersPopoverComponent },
    { path: 'schedule', component: ScheduleComponent },
    { path: 'sponsors', component: SponsorsComponent },
    { path: 'sponsors/zoho', component: ZohoComponent },
    { path: 'sponsors/oddup', component: OddupComponent },
    { path: 'sponsors/wadhwani', component: WadhwaniComponent }
];
let HomeRoutingModule = /** @class */ (() => {
    let HomeRoutingModule = class HomeRoutingModule {
    };
    HomeRoutingModule = __decorate([
        NgModule({
            imports: [RouterModule.forChild(routes)],
            exports: [RouterModule],
            providers: [AuthGuard]
        })
    ], HomeRoutingModule);
    return HomeRoutingModule;
})();
export { HomeRoutingModule };
//# sourceMappingURL=home-routing.module.js.map