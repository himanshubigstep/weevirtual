import { __decorate } from "tslib";
import { Component, ViewChild } from '@angular/core';
import { Chatbox } from 'src/app/shared/models/chatInbox';
import { ScrollToBottomDirective } from '../meeting-hall/scroll-to-bottom.directive';
let MobileChatComponent = /** @class */ (() => {
    let MobileChatComponent = class MobileChatComponent {
        constructor(chatServeice, eventService, router) {
            this.chatServeice = chatServeice;
            this.eventService = eventService;
            this.router = router;
            this.question = new Chatbox();
            this.userDetails = this.eventService.getEventDetails();
        }
        ngOnInit() {
            this.getMeetingChat(this.userDetails.event_details.id);
        }
        submitQuestion() {
            this.question.senderName = this.userDetails.user_details.name;
            this.question.eventId = this.userDetails.event_details.id;
            this.question.senderId = this.userDetails.user_details.id;
            this.question.user_type = this.userDetails.user_details.user_type;
            this.question.isApproved =
                this.userDetails.user_details.user_type != "attendee" ? true : false;
            this.question.timeStamp = Date.now();
            if (this.question.message.trim() == "") {
                return false;
            }
            this.chatServeice.addToMeeting(this.question);
            console.log("chat-body-->", this.question);
            this.question = new Chatbox();
        }
        // get meeting chat
        getMeetingChat(eventId) {
            this.chatServeice.getWebinarChat(eventId).subscribe((res) => {
                this.questionList = res;
                console.log("chat list-->", this.questionList);
                if (this.userDetails.user_details.user_type == "attendee" ||
                    this.userDetails.user_details.user_type == "panellist" ||
                    this.userDetails.user_details.user_type == "emcee") {
                    this.getChatlistAttendee();
                }
                this.questionList.sort(function (a, b) {
                    return a.timeStamp - b.timeStamp;
                });
                // this.scrollToBottom();
            });
        }
        approveMessage(id) {
            this.chatServeice.aproveChat(id);
        }
        // pending message display self only
        getChatlistAttendee() {
            this.questionList = this.questionList.filter((item) => {
                return (item.isApproved == true ||
                    (item.isApproved == false &&
                        item.senderId == this.userDetails.user_details.id));
            });
        }
        navigateTomeetinghall() {
            this.router.navigate(['home/meeting-hall']);
        }
    };
    __decorate([
        ViewChild(ScrollToBottomDirective)
    ], MobileChatComponent.prototype, "scroll", void 0);
    MobileChatComponent = __decorate([
        Component({
            selector: 'app-mobile-chat',
            templateUrl: './mobile-chat.component.html',
            styleUrls: ['./mobile-chat.component.scss']
        })
    ], MobileChatComponent);
    return MobileChatComponent;
})();
export { MobileChatComponent };
//# sourceMappingURL=mobile-chat.component.js.map