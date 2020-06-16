import { Component, OnInit, ViewChild } from '@angular/core';
import { ChatService } from 'src/app/shared/services/chat.service';
import { EventService } from 'src/app/shared/services/event.service';
import { Router } from '@angular/router';
import { Chatbox } from 'src/app/shared/models/chatInbox';
import { ScrollToBottomDirective } from '../meeting-hall/scroll-to-bottom.directive';

@Component({
  selector: 'app-mobile-chat',
  templateUrl: './mobile-chat.component.html',
  styleUrls: ['./mobile-chat.component.scss']
})
export class MobileChatComponent implements OnInit {
  @ViewChild(ScrollToBottomDirective)
  scroll: ScrollToBottomDirective;
  public question: Chatbox;
  public questionList;
  public userDetails: any;
  constructor(
    public chatServeice: ChatService,
    private eventService: EventService,
    private router: Router
  ) {
    this.question = new Chatbox();
    this.userDetails = this.eventService.getEventDetails();
   }

  ngOnInit(): void {
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
      if (
        this.userDetails.user_details.user_type == "attendee" ||
        this.userDetails.user_details.user_type == "panellist" ||
        this.userDetails.user_details.user_type == "emcee"
      ) {
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
      return (
        item.isApproved == true ||
        (item.isApproved == false &&
          item.senderId == this.userDetails.user_details.id)
      );
    });
  }

  navigateTomeetinghall(){
    this.router.navigate(['home/meeting-hall']);
  }

}
