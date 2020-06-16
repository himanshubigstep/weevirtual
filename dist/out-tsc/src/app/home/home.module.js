import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { LoungeComponent } from './lounge/lounge.component';
import { MeetingHallComponent } from './meeting-hall/meeting-hall.component';
import { SpeakersPopoverComponent } from './speakers-popover/speakers-popover.component';
import { EventLandingPageComponent } from './event-landing-page/event-landing-page.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { ScheduleComponent } from './schedule/schedule.component';
import { ZohoComponent } from './sponsors/zoho/zoho.component';
import { OddupComponent } from './sponsors/oddup/oddup.component';
import { WadhwaniComponent } from './sponsors/wadhwani/wadhwani.component';
import { NgxAgoraModule } from "ngx-agora";
import { TimeAgoPipePipe } from '../pipe/time-ago-pipe.pipe';
import { ScreenShareComponent } from './meeting-hall/screen-share/screen-share.component';
import { ScrollToBottomDirective } from '../home/meeting-hall/scroll-to-bottom.directive';
import { NgbPaginationModule, NgbAlertModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MobileChatComponent } from './mobile-chat/mobile-chat.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MeetingHallDailogComponent } from './meeting-hall/dailog/meeting-hall-dailog/meeting-hall-dailog.component';
import { MatTabsModule } from '@angular/material/tabs';
const agoraConfig = {
    AppID: "bc77dbe489d5466bb0084e0ff147ab9f",
};
let HomeModule = /** @class */ (() => {
    let HomeModule = class HomeModule {
    };
    HomeModule = __decorate([
        NgModule({
            declarations: [
                HomeComponent,
                LoungeComponent,
                MeetingHallComponent,
                SpeakersPopoverComponent,
                EventLandingPageComponent,
                FooterComponent,
                HeaderComponent,
                ScheduleComponent,
                ZohoComponent,
                OddupComponent,
                WadhwaniComponent,
                TimeAgoPipePipe,
                ScrollToBottomDirective,
                ScreenShareComponent,
                MobileChatComponent,
                MeetingHallDailogComponent
            ],
            imports: [
                CommonModule,
                SharedModule,
                HomeRoutingModule,
                MatMenuModule,
                NgxAgoraModule.forRoot(agoraConfig),
                FormsModule,
                ReactiveFormsModule,
                TextFieldModule,
                NgbPaginationModule, NgbAlertModule, NgbModule,
                MatDialogModule,
                MatTabsModule
            ],
            providers: []
        })
    ], HomeModule);
    return HomeModule;
})();
export { HomeModule };
//# sourceMappingURL=home.module.js.map