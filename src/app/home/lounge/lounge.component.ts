import { Component, OnInit, ElementRef, ViewChild, Renderer2,OnDestroy } from '@angular/core';
import * as AgoraRTM from "agora-rtm-sdk";
import EventEmitter from "event-emitter";
import { EventService } from '../../shared/services/event.service';
import { Router } from '@angular/router';

import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {NgbPopoverConfig} from '@ng-bootstrap/ng-bootstrap';
import { Meta, Title } from '@angular/platform-browser';

declare var $: any;
declare var jQuery:any;

@Component({
  selector: 'app-lounge',
  templateUrl: './lounge.component.html',
  styleUrls: ['./lounge.component.scss'],
  providers:[NgbPopoverConfig]
})
export class LoungeComponent implements OnInit {

  @ViewChild('toggleButton') toggleButton: ElementRef;
  @ViewChild('menu') menu: ElementRef;

  isMenuOpen = false;
  enableVideoStreaming = false;
  enableVideoJoiningButton = false;
  enableSpeakerLounge = false;
  enableJoinnow = false;
  eventAllDetails;
  event_details;
  sponsors_details;
  user_details;
  activeDate;
  Webinar;
  Schedule_Details;
  clickActive = true;
  interval;
  timeLeft;
  days;
  hours;
  mins;
  secs;
  timerObj;
  Name;
  fullName;
  getVideoStatusCheckTimer ;
  month = ['Jan',
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
  dates = [];

  private rtmClient;
  private rtmChannel;
  private channelEmitter;
  public userDetails: any;
  uid: number;
  /**
   * App ID used when connecting to the Agora.io servers
   */
  appId = "bc77dbe489d5466bb0084e0ff147ab9f";

  constructor(
    private eventService: EventService,
    private router: Router,
    private renderer: Renderer2,
    config: NgbPopoverConfig,
    private title: Title,
    private meta: Meta
    ) {
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

    this.rtmClient  = AgoraRTM.createInstance(this.appId);  
    this.rtmChannel = this.rtmClient.createChannel("RTMChannel");

    this.channelEmitter = new EventEmitter();

    this.assignRtmHandlers();
    this.assignRtmChannelEmitterHandlers();

    this.userDetails = this.eventService.getEventDetails();

    this.uid = this.userDetails.user_details.id; //Math.floor(Math.random() * 100);

    this.joinRTMChannel();

   }

  ngOnInit(): void {
    
    this.timerObj = this.eventService.timer();
    this.timer();
    this.eventAllDetails = this.eventService.getEventDetails();
    this.eventService.eventDetails_Update.subscribe(response => {
      let res = response;
      console.log(response);
      this.eventAllDetails = this.eventService.getEventDetails();
      this.user_details = this.eventAllDetails.user_details;
      this.eventService.getVedioStreaminStatus(this.user_details.user_type,this.user_details.event).subscribe(response => {
        let res = response;
        this.enableVideoStreaming = res.status;
      });
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
      
    });
    let resVideo;
    this.eventService.connect().subscribe(response =>{
      resVideo = JSON.parse(response.data);
      console.log(resVideo,this.user_details);
      if(this.user_details.user_type == 'panellist'){
        this.enableVideoStreaming = resVideo.panelist;
      }
      if(this.user_details.user_type == 'attendee'){
        console.log(this.user_details.user_type,resVideo.attendee);
        this.enableVideoStreaming = resVideo.attendee;
      }
    });
    this.videoModal();
    this.popOver();

    // SEO Meta Tags
    this.title.setTitle('Welcome | Leaders Of Tomorrow - Season 8 | Largest Entrepreneurship Platform | ET NOW');
    this.meta.addTags([
      { name: 'description', content: 'Welcome to Session On Technology and Innovation for Sustainability. Leaders of Tomorrow - Season 8, the most comprehensive enabling platform for small businesses.' }
    ]);

    if(localStorage.getItem("enableJoinNow") == "yes"){
      console.log("switchonjoinnowbtn")
      this.enableVideoJoiningButton= true;
      this.enableVideoStreaming = true;
      this.enableJoinnow = true;
    }

    if(localStorage.getItem("enableSpeakerLounge") == "yes"){
      this.enableSpeakerLounge = true;
      this.enableVideoJoiningButton = true;
    }

  }



  joinRTMChannel(){
    const loginUid = new Date().valueOf();
    this.rtmClient.login({ token: null, uid: loginUid.toString() } ).then(() => {
      this.rtmChannel.join().then(() => {
        console.log('Channel join');
        this.channelEmitter.emit('joinedChannel');
      }).catch(err => {
        console.log('Channel join failure', err);
      });
    })
  }

  private assignRtmHandlers(): void{

    // CHECK STATE OF CONNECTION
    this.rtmClient.on('ConnectionStateChanged', (newState, reason) => {
      console.log('on connection state changed to ' + newState + ' reason: ' + reason);
      if( newState == 'DISCONNECTED' ) {
        this.joinRTMChannel();
        console.log("disconnected")
      }
    });

    // EVENT OF RECEVING PEER MESSAGE
    this.rtmClient.on('MessageFromPeer', ({ text }, peerId) => { 
      /* Your code for handling the event of receiving a peer-to-peer message. */
        console.log("message from peer working " + peerId);
    });

    // MEMBER JOINED
    this.rtmChannel.on('MemberJoined', memberId => {
      console.log("[RTM-DEMO] MemberJoin", memberId);
      this.joinRTMChannel();
    });

    // MEMBER LEAVED
    this.rtmChannel.on('MemberLeft', memberId => {
      console.log('[RTM-DEMO] MemberLeft', memberId)
    });

    // CHANNEL MESSAGE
    this.rtmChannel.on('ChannelMessage', ({ text: message }, senderId) => {
      console.log('ChannelMessage :', message , senderId);
      this.channelEmitter.emit(`${message}`, message);
    });

  }

  private assignRtmChannelEmitterHandlers():void{

      console.log("hlwrtm");
        
      this.channelEmitter.on('joinedChannel', () => {
        console.log("Channel emitter work fine");
      });

      this.channelEmitter.on(`speaker-lounge-on`, function ( {content}) {
       
        // ALLOW SPEAKER LOUNGE TO JOIN CALL
        console.log("speakerloungeon");
        this.enableSpeakerLounge= true;
        localStorage.setItem("enableSpeakerLounge", "yes");
        location.reload();
      });

      this.channelEmitter.on(`speaker-lounge-off`, function ( {content}) {        
        // DISALLOW SPEAKER LOUNGE TO JOIN CALL
        console.log("speakerloungeoff");
        this.enableSpeakerLounge= false;
        localStorage.setItem("enableSpeakerLounge", "no");
        location.reload();
      });

      this.channelEmitter.on(`join-now-on`, function ( {content}) {
       
        // ALLOW JOIN NOW TO JOIN CALL
        console.log("joinnowon");
        this.enableVideoJoiningButton= true;
        this.enableVideoStreaming = true;
        this.enableJoinnow = true;
        localStorage.setItem("enableJoinNow", "yes");
        location.reload();

      });

      this.channelEmitter.on(`join-now-off`, function ( {content}) {
        
        // DISALLOW JOIN NOW TO JOIN CALL
        console.log("joinnowoff");
        this.enableVideoJoiningButton= false;
        this.enableVideoStreaming = false;
        this.enableJoinnow = false;
        localStorage.setItem("enableJoinNow", "no");
        location.reload();
        
      });

      this.channelEmitter.on(`join-session-room-on`, function ( {content}) {
       
        // ALLOW SESSION ROOM TO JOIN CALL
        console.log("joinsessionroomon");
      });

      this.channelEmitter.on(`join-session-room-off`, function ( {content}) {
        
        // DISALLOW SESSION ROOM TO JOIN CALL
        console.log("joinsessionroomoff");
      });
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

  navigateToSessionRoom(){
    localStorage.setItem("userRole", "audience");
    this.router.navigate(["/home/session-room"]);
  }

  navigateToMeetingHall() {
    clearInterval(this.getVideoStatusCheckTimer);
    this.router.navigate(['/home/meeting-hall']);
  }
  navigatetologin() {
    localStorage.clear();
    localStorage.setItem('reload','true');
    this.router.navigate(['/home']);

  }
  timer() {
    console.log(this.timerObj);
    this.days = this.timerObj.days;
    this.hours = this.timerObj.hours;
    this.secs = this.timerObj.secs;
    this.mins = this.timerObj.mins;
    if(this.days >= 0){
    this.interval = setInterval(() => {
      if (this.secs > 0) {
        this.secs--;
      } else {
        if (this.mins > 0) {
          this.mins--;
        } else {
          if (this.hours < 24) {
            this.hours--;
          } else {
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
  }else{
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
    let docDefinition = {}


    pdfMake.createPdf(docDefinition).download('Organiser-details');
  }

  videoModal(){
    $('.modal').each(function(){
            var src = $(this).find('iframe').attr('src');
        $(this).on('click', function(){
            $(this).find('iframe').attr('src', '');
            $(this).find('iframe').attr('src', src);
        });
    });
  }
  popOver(){
    $().popover({container: 'body'})
  }

  
OnDestroy() {
  clearInterval(this.getVideoStatusCheckTimer);
}
}
