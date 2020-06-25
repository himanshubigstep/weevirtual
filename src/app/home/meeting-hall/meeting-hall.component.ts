import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import {
  AgoraClient,
  ClientEvent,
  NgxAgoraService,
  Stream,
  StreamEvent,
} from "ngx-agora";
import { DOCUMENT } from '@angular/common';
import { Chatbox } from "src/app/shared/models/chatInbox";
import { ChatService } from "src/app/shared/services/chat.service";
import { ReturnStatement } from "@angular/compiler";
import { EventService } from "src/app/shared/services/event.service";
import { Router } from "@angular/router";
import { ScrollToBottomDirective } from "./scroll-to-bottom.directive";
import { Meta, Title } from '@angular/platform-browser';
import * as AgoraRTM from "agora-rtm-sdk";
import EventEmitter from "event-emitter";
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs';
import { MeetingHallDailogComponent } from "src/app/home/meeting-hall/dailog/meeting-hall-dailog/meeting-hall-dailog.component";
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from 'src/app/shared/services/http.service';

declare var $: any;

@Component({
  selector: "app-meeting-hall",
  templateUrl: "./meeting-hall.component.html",
  styleUrls: ["./meeting-hall.component.scss"],
})
export class MeetingHallComponent implements OnInit {
  @ViewChild(ScrollToBottomDirective)
  scroll: ScrollToBottomDirective;
  private localStream: Stream;
  private screenStream: Stream;
  private client: AgoraClient;
  private screenClient: AgoraClient;
  public question: Chatbox;
  public questionList;
  public userDetails: any;
  private rtmClient;
  private rtmChannel;
  private channelEmitter;
  private isReady ;

  panellistUsersList = [];
  totalUsersList = [];
  userType:any;
  selectuserType: String;

  activeTab = 1;
  activeTab2 = 1;
  progressTab = 1;
  timerForm: FormGroup;
  hd = true;
  hd_plus = false;
  individualHd = true;
  individualHdPlus = false;
  disabledIcon = true;
  disabledIcon2 = true;
  hours;
  minutes;
  seconds;
  h;
  m;
  s;
  totalSeconds;
  isShow = true;
  switch_view = true;
  /**
   * App ID used when connecting to the Agora.io servers
   */
  appId = "bc77dbe489d5466bb0084e0ff147ab9f";
  /**
   * Channel (meeting room) within the Agora app to join
   */
  channel = "12345";
  /**
   * Generated user ID that is attached to the local client when joining a meeting room
   */
  uid: number;
  screenClientJoined = false;

  /**
   * All the IDs of other users that have joined the call
   */
  remoteCalls: any[] = [];
  // remoteScreenShare: string = "";
  screenShare: boolean = false;
  /**
   * Whether the local client has tuned in to the Agora meeting room
   */
  connected = false;
  screenShareDivID: String;
  /**
   * Whether the local client's A/V stream has been published to the remote meeting room
   */
  published = false;

  userRole: any = "audience"; // to set user role as host or audience

  audioMuted = false;
  videoMuted = false;

  remoteAudioMuted = false;
  remoteVideoMuted= false;

  screenShareDiv: string = "agora_screen";

  constructor(
    private agoraService: NgxAgoraService,
    public  chatServeice: ChatService,
    public  httpservice: HttpService,
    private eventService: EventService,
    private router: Router,
    private title: Title,
    private meta: Meta,
    public dialog: MatDialog,
    private fb: FormBuilder,
    config: NgbDropdownConfig,
    @Inject(DOCUMENT) private document: any
  ) {
    this.userDetails = this.eventService.getEventDetails();

    this.question = new Chatbox();
    this.uid = this.userDetails.user_details.id; //Math.floor(Math.random() * 100);

    this.client = this.agoraService.createClient({
      mode: "live",
      codec: "h264",
    });
    //this.assignClientHandlers();

    this.screenClient = this.agoraService.createClient({
      mode: "rtc",
      codec: "vp8",
    });
    //this.assignScreenClientHandlers();

    //this.join();

    let uType:any = localStorage.getItem('currentUser');
    this.userType = JSON.parse(uType);
    //console.log(this.userType.type);

    // RTM 
    this.isReady = false ;
    this.rtmClient  = AgoraRTM.createInstance(this.appId); 
    this.rtmChannel = this.rtmClient.createChannel(this.channel);
    this.channelEmitter = new EventEmitter();

    console.log(this.rtmClient);
    console.log('rtm client working');
    this.assignRtmHandlers();
    this.assignRtmChannelEmitterHandlers();

    // RTM LOGIN
    this.rtmLogin();

  }
  elem;
  mediaList: any;

  ngOnInit() {

    this.httpservice.get(
      `events/media-upload/` + 1
    ).subscribe(result => {
      this.mediaList = result;
      console.log(result);
      //this.animal = result;
    });
    
    this.getMeetingChat(this.userDetails.event_details.id);
    this.loadSessionTimerForm();
    
    this.getPanellistUsers(this.userDetails.event_details.id);

    // this.client.init(
    //   this.appId,
    //   () => console.log("Initialized successfully"),
    //   () => console.log("Could not initialize")
    // );

    // this.screenClient.init(
    //   this.appId,
    //   () => console.log("screen Initialized successfully"),
    //   () => console.log("screen Could not initialize")
    // );

    this.loadCarouselScript();

    const urlParams = new URLSearchParams(window.location.search);
        console.log(urlParams.get('role'));

    if (
      this.userDetails.user_details.user_type != "audience" &&
      this.userDetails.user_details.user_type != "attendee"
    ) {
      this.screenShareDivID = "agora_remote-screen-" + this.uid;
      this.remoteCalls.push({
        divId: "agora_remote-" + this.uid,
        userName: this.userDetails.user_details.name,
        designation: this.userDetails.user_details.designation,
      });
      
      this.userRole = "host";
      // if(this.userDetails.user_details.user_type!='admin'){
      //   this.userRole = 'audience';
      // }
      console.log(this.userDetails.user_details.user_type)
      console.log("userrole"+this.userRole)
      
    }

    this.getMeetingChat(this.userDetails.event_details.id);

    // SEO Meta Tags
    this.title.setTitle('Meeting Hall | Leaders Of Tomorrow - Season 8 | Largest Entrepreneurship Platform | ET NOW');
    this.meta.addTags([
      { name: 'description', content: 'Session On Technology and Innovation for Sustainability. Leaders of Tomorrow - Season 8, the most comprehensive enabling platform for small businesses.' },
    ]);
    
  }

  // Session Timer Form
  loadSessionTimerForm() {
    this.timerForm = this.fb.group({
      firstDigit: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]],
      secondDigit: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]],
      thirdDigit: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]],
      fourthDigit: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]],
      fifthDigit: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]],
      sixthDigit: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]],
    });
  }
  loadSeoTags() {
    this.title.setTitle('Meeting Hall | Leaders Of Tomorrow - Season 8 | Largest Entrepreneurship Platform | ET NOW');
    this.meta.addTags([
      {
        name: 'description',
        content: 'Session On Technology and Innovation for Sustainability. Leaders of Tomorrow - Season 8, the most comprehensive enabling platform for small businesses.'
      },
    ]);
  }

  /* Recording functions */
  selectHdResolution() {
    this.hd = !this.hd;
    this.hd_plus = false;
  }

  selectHdPlusResolution() {
    this.hd_plus = !this.hd_plus;
    this.hd = false;
  }

  selectHdResolutionIndividual() {
    this.individualHd = !this.individualHd;
    this.individualHdPlus = false;
  }

  selectHdPlusResolutionIndividual() {
    this.individualHdPlus = !this.individualHdPlus;
    this.individualHd = false;
  }

  capturePremiseChange(event) {
    if (event.checked == true) {
      this.disabledIcon = false;
    }
    else {
      this.disabledIcon = true;
    }
  }

  captureIndividualChange(event) {
    if (event.checked == true) {
      this.disabledIcon2 = false;
    }
    else {
      this.disabledIcon2 = true;
    }
  }

  // SwapView
  swapView() {
    this.switch_view = !this.switch_view;
  }


  // Handle Reverse timer
  onSubmitStartTimer() {

    this.isShow = !this.isShow;

    this.hours = `${this.timerForm.get('firstDigit').value}${this.timerForm.get('secondDigit').value}`;
    this.minutes = `${this.timerForm.get('thirdDigit').value}${this.timerForm.get('fourthDigit').value}`;
    this.seconds = `${this.timerForm.get('fifthDigit').value}${this.timerForm.get('sixthDigit').value}`;

    this.h = this.hours * 3600;
    this.m = this.minutes * 60;
    this.s = this.seconds * 1;

    this.totalSeconds = this.h + this.m + this.s;

    console.log('Total Seconds', this.totalSeconds);
  }

  // Focus next field in the session timer
  tabChange(val, event?): void {
    const regEx = /^[0-9]*$/;
    const ele: any = document.querySelectorAll('.digit');
    ele[val].focus();
    if (regEx.test(event.target.value)) {
      const ele: any = document.querySelectorAll('.digit');
      console.log('EVENTS => ', event);
      if (ele[val - 1].value !== '') {
        ele[val] ? ele[val].focus() : ele[val - 1].focus();
      } else if (ele[val - 1].value === '') {
        ele[val - 2] ? ele[val - 2].focus() : ele[val - 1].focus();
      }
    } else {
      event.target.value = '';
    }

  }

openDialog(): void {
    const dialogRef = this.dialog.open(MeetingHallDailogComponent, {
      width: '600px',
       //data: {name: this.name, animal: this.animal}
     });

     dialogRef.afterClosed().subscribe(result => {
       console.log('The dialog was closed');
       //this.animal = result;
     });
   }

  private assignRtmHandlers(): void{

    // CHECK STATE OF CONNECTION
    this.rtmClient.on('ConnectionStateChanged', (newState, reason) => {
      console.log('on connection state changed to ' + newState + ' reason: ' + reason);
      if( newState == 'DISCONNECTED' ) {
        this.rtmLogin();
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
    });

    // MEMBER LEAVED
    this.rtmChannel.on('MemberLeft', memberId => {
      console.log('[RTM-DEMO] MemberLeft', memberId)
    });

    // CHANNEL MESSAGE
    this.rtmChannel.on('ChannelMessage', ({ text: message }, senderId) => {
      console.log('ChannelMessage :', message , senderId);
      this.channelEmitter.emit(`${message}-TO-JOIN`, message);
    });

  }

  private assignRtmChannelEmitterHandlers():void{
      
      this.channelEmitter.on('joinedChannel', () => {
        this.isReady = true;
        console.log("Channel emitter work fine");
        this.sendChannelMessage('helloworld');
      });

      this.channelEmitter.on(`ALLOW_MODERATOR-TO-JOIN`, function ( {content}) {
       
        // ALLOW MODERATOR TO JOIN CALL

      });

      this.channelEmitter.on(`ALLOW_PANELLIST-TO-JOIN`, function ( {content}) {
        
        // ALLOW PANELLIST TO JOIN CALL
        
      });

      this.channelEmitter.on(`ALLOW_ATTENDEE-TO-JOIN`, function ( {content}) {
        
        // ALLOW ATTENDEE TO JOIN CALL
        
      });
  }

  private rtmLogin(){

    this.rtmClient.login({ token: null, uid: this.uid.toString() } ).then(() => {
      console.log('AgoraRTM client login success');
      this.sendPeerMessage();
      this.join();
      // JOIN CHANNEL
      this.rtmChannel.join().then(() => {
        console.log('Channel join');
        this.channelEmitter.emit('joinedChannel');
      }).catch(err => {
        console.log('Channel join failure', err);
      });

    }).catch(err => {
      console.log('AgoraRTM client login failure', err);
    });

  }

  private rtmLogout(){
    this.leaveChannel();
    this.rtmClient.logout().then(() => {
       console.log('AgoraRTM client logout');
    }).catch(err => {
       console.log('AgoraRTM client logout failure', err);
    });
  }

  private leaveChannel(){

    // LEAVE CHANNEL
    this.rtmChannel.leave().then(() => {
      console.log('Channel leave');
    }).catch(err => {
      console.log('Channel leave failure', err);
    });

  }

  private sendChannelMessage(message){
    if (!this.isReady) {
      console.log("user not logged in channel");
      return;
    }
    this.rtmChannel.sendMessage({  text: `${message}` }).then(() => {
      console.log("channel message-send success") ;
    }).catch(error => {
      console.log("channel message-send failure") ;
    });

  }

  private sendPeerMessage(){

    // PEER TO PEER MESSAGE
    this.rtmClient.sendMessageToPeer({ text: 'test peer message' }, // An RtmMessage object.
      this.uid.toString(), // The user ID of the remote user.
    ).then(sendResult => {
      if (sendResult.hasPeerReceived) {

        console.log('yes peer received');
        /* Your code for handling the event that the remote user receives the message. */

       } else {

          console.log('not peer received');
          /* Your code for handling the event that the message is received by the server but the remote user cannot be reached. */

       }

    }).catch(error => {
        
        console.log('peer error');
        /* Your code for handling the event of a message send failure. */
    });

  }

  private assignClientHandlers(): void {

    console.log("hlwassignclient")
    console.log(ClientEvent)
    this.client.on(ClientEvent.LocalStreamPublished, (evt) => {
      this.published = true;
      console.log("Publish local stream successfully");
    });

    this.client.on(ClientEvent.Error, (error) => {
      console.log("Got error msg:", error.reason);
      if (error.reason === "DYNAMIC_KEY_TIMEOUT") {
        this.client.renewChannelKey(
          "",
          () => console.log("Renewed the channel key successfully."),
          (renewError) =>
            console.error("Renew channel key failed: ", renewError)
        );
      }
    });

    this.client.on(ClientEvent.RemoteStreamAdded, (evt) => {
      console.log("hlwsubscribe")
      const stream = evt.stream as Stream;
      this.client.subscribe(stream, { audio: true, video: true }, (err) => {
        console.log("Subscribe stream failed", err);
      });
    });

    this.client.on(ClientEvent.RemoteStreamSubscribed, (evt) => {
      console.log("stream subscribed")
      const stream = evt.stream as Stream;
      const id = this.getRemoteId(stream);

      this.totalUsersList.push(id);
      // const selectedObj = true;
      console.log(
        this.panellistUsersList.filter((res) => res.id == stream.getId())
      );
      const selectedObj = this.panellistUsersList.filter(
        (res) => res.id == stream.getId()
      )[0];
      //if (selectedObj) {
        console.log("hlwselectedobj")
        console.log(stream)
        console.log(selectedObj)
        // this.remoteCalls.push({ divId: id, userName: "full name ", designation: 'developer' });
        if((typeof this.screenStream== 'undefined') || (stream.getId()!=this.screenStream.getId())){
          this.remoteCalls.push({
            divId: id,
            // userName: selectedObj.full_name,
            // designation: selectedObj.designation,
            userName: "Sanjeev",
            designation: "Developer",
            stream: stream
          });
        //}
        // this.remoteCalls.push({
        //   divId: id,
        //   // userName: selectedObj.full_name,
        //   // designation: selectedObj.designation,
        //   userName: "Sanjeev",
        //   designation: "Developer",
        // });

        setTimeout(() => stream.play(id), 1000);
      }
    });

    this.client.on(ClientEvent.RemoteStreamRemoved, (evt) => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        stream.close();
        this.removeRemoteStream(stream);
        //this.remoteCalls = [];
        console.log(`Remote stream is removed ${stream.getId()}`);
      }
    });

    this.client.on(ClientEvent.PeerLeave, (evt) => {
      const stream = evt.stream as Stream;
      if (stream) {
        console.log(this.remoteCalls)
        console.log(stream['params'].streamID)
        //this.destroy();
        stream.stop();
        stream.close();
        
        this.removeRemoteStream(stream);

        const removeClientStreamId = `${this.getRemoteId(stream)}`;
        
        this.totalUsersList = this.totalUsersList.filter(
          (call) => call !== removeClientStreamId
        );
        console.log(`${evt.uid} left from this channel localclient`);
        console.log(`${this.getRemoteId(stream)}`)
        console.log("this.remoteCalls")
        console.log(this.remoteCalls)
      }
    });
  }

  removeRemoteStream = (stream) => {
    const removeClientStreamId = `${this.getRemoteId(stream)}`;
    this.remoteCalls = this.remoteCalls.filter(
      (call) => call.divId !== removeClientStreamId
    );
  }

  private assignScreenClientHandlers(): void {
   
    this.screenClient.on(ClientEvent.LocalStreamPublished, (evt) => {
      //this.published = true;
      console.log("Publish screen screen stream successfully");
    });

    this.screenClient.on(ClientEvent.Error, (error) => {
      console.log("Got error msg:", error.reason);
      if (error.reason === "DYNAMIC_KEY_TIMEOUT") {
        this.screenClient.renewChannelKey(
          "",
          () => console.log("Renewed the channel key successfully."),
          (renewError) =>
            console.error("Renew channel key failed: ", renewError)
        );
      }
    });

    this.screenClient.on(ClientEvent.PeerLeave, (evt) => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        console.log(`${evt.uid} left from this channel screenclient`);
      }
    });

    // this.screenStream.on("stopScreenSharing", () => {
    //  console.log("Stop Screen Sharing at" + new Date());
    // });

  }

  join(): void {
    if (!this.connected) {
      
      this.client.init(
        this.appId,
        () => {
          console.log("Initialized successfully") 
          this.client.join(null, this.channel, this.uid, (uid) => {
            console.log("User " + uid + " join channel successfully")

            this.assignClientHandlers()

            this.client.setClientRole(this.userRole, () => {
              console.log("client role changed");
            });

            this.localStream = this.agoraService.createStream({
              streamID: this.uid,
              audio: true,
              video: true,
              screen: false,
            });

            this.assignLocalStreamHandlers();

            this.init();
            
          });
        },
        () => console.log("Could not initialize")
      );
    
    } else {
      alert("Aready joined the event ");
    }

    // Sets the audio profile with a 48-kHz sampling rate, stereo sound, and 192-Kbps bitrate.
    // this.localStream.setAudioProfile("high_quality_stereo");
    // this.client.enableAudioVolumeIndicator();
  }

  protected init(): void {
    this.localStream.init(
      () => {
        // The user has granted access to the camera and mic.
        console.log("getUserMedia successfully");

        if(this.userRole=='host'){
          this.publish();
        }

        if (
          this.userDetails.user_details.user_type != "audience" &&
          this.userDetails.user_details.user_type != "attendee"
        ) {
          this.localStream.play("agora_remote-" + this.uid);
        }
        this.connected = true;
      },
      (err) => console.log("getUserMedia failed", err)
    );
  }

  private assignLocalStreamHandlers(): void {
    // The user has granted access to the camera and mic.
    this.localStream.on(StreamEvent.MediaAccessAllowed, () => {
      console.log("accessAllowed");
    });
    // The user has denied access to the camera and mic.
    this.localStream.on(StreamEvent.MediaAccessDenied, () => {
      console.log("accessDenied");
    });
  }

  publish(): void {
    this.client.publish(this.localStream, (err) =>
      console.log("Publish local stream error: " + err)
    );
  }

  leave(): void {
    if (this.connected) {
      this.client.leave(
        () => {
          console.log("Left the channel successfully");
          
          this.unpublish();
          this.localStream.stop();
          this.localStream.close();
          // this.connected = false;
          // this.published = false;
          //this.remoteCalls = [];
          this.screenShareDivID = "";

          this.router.navigate(["/home/lounge/"]);
        },
        (err) => {
          console.log("Leave channel failed");
        }
      );
      this.rtmLogout();
    } else {
      this.agoraService.AgoraRTC.Logger.warning(
        "Local client is not connected to channel."
      );
    }
  }

  unpublish(): void {
    this.client.setClientRole('audience');
    this.client.unpublish(this.localStream, (error) => console.error(error));
    this.published = false;
  }

  shareScreen(): void {

    console.log("hlwsharescreen")
   
    var userID = null; // set to null to auto generate uid on successfull connection

    if(!this.screenClientJoined){
      this.screenClient.init(
        this.appId,
        () => { 
          console.log("screen Initialized successfully") 
          this.screenClient.join(null, this.channel , userID, (uid) => {
            console.log(
              'join channel: ' + this.channel + ' success, uid: ' + uid
            )
            this.screenClientJoined = true;
            this.initScreenShare()
          })
        },
        () => console.log("screen Could not initialize")
      );
    }else{
      this.initScreenShare()
    }

    //Number.tem = windows.navigator.userAgent.match(/(Chrome(?=\/))\/?(\d+)/i);
    //if(parseInt(tem[2]) >= 72  && navigator.mediaDevices.getDisplayMedia ) {
     // Create the stream for screensharing
        // this.screenStream = this.agoraService.createStream({
        //     streamID: this.uid + "-screen",
        //     audio: false,
        //     video: false,
        //     screen: true,
        // });
    //}

    // this.assignLocalScreenStreamHandlers();
    // this.initScreenShare();

    // this.screenClient.join(null, this.channel , userID);
    // setTimeout(() => {

    //     this.screenPublish();
    //     this.totalUsersList.push("agora_remote-screen" + this.uid);
    //   }, 3000);

  }

  private assignLocalScreenStreamHandlers(): void {
    // The user has granted access to the camera and mic.
    this.screenStream.on(StreamEvent.MediaAccessAllowed, () => {
      console.log("accessAllowed");
    });
    // The user has denied access to the camera and mic.
    this.screenStream.on(StreamEvent.MediaAccessDenied, () => {
      console.log("accessDenied");
    });
  }

  protected initScreenShare(): void {

    this.screenStream = this.agoraService.createStream({
        streamID: this.uid + "-screen",
        audio: false,
        video: false,
        screen: true,
    });

    this.assignScreenClientHandlers();

    this.screenStream.init(
      () => {
        this.screenPublish();
        // The user has granted access to the camera and mic.
        // console.log("getUserMedia successfully");
        this.screenShare = true;
        const user_id = this.uid+'-screen';
        console.log("screestream"+user_id)
        console.log(this.screenStream)
        console.log(this.screenStream['params'].streamID)
        if(user_id != this.screenStream['params'].streamID){
          this.screenStream.play("agora_remote-" + this.uid);
        }
        
      },
      (err) => console.log("getUserMedia failed", err)
    );
  }

  screenPublish(): void {
    this.screenClient.publish(this.screenStream, (err) =>
       console.log("Publish local screen stream error: " + err)
     );
  } 

  getPanellistUsers(eventId) {
    console.log("event id"+eventId)
    this.eventService
      .getPanellistByEventId({ event_id: eventId })
      .then((response: any) => {
        console.log(response);
        if (response.panellists.length > 0) {
          this.panellistUsersList = response.panellists;
        } else {
          this.panellistUsersList = [];
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  private getRemoteId(stream: Stream): string {
    console.log(stream.getId());
    return `agora_remote-${stream.getId()}`;
  }

  // load carousel
  loadCarouselScript() {
    $(".owl-carousel").owlCarousel({
      margin: 20,
      dots: false,
      autoplay: true,
      autoplayHoverPause: true,
      responsiveClass: true,
      responsive: {
        0: {
          items: 1,
          nav: true,
          loop: true,
        },
        767: {
          items: 1,
          nav: true,
          loop: true,
        },
        991: {
          items: 1,
          nav: true,
          loop: true,
        },
      },
    });
  }

  muteRemoteAudio(stream_id){
    this.remoteCalls[stream_id].stream.muteAudio();
    this.remoteAudioMuted = true;
  }

  unRemoteMuteAudio(stream_id) {
    this.remoteCalls[stream_id].stream.unmuteAudio();
    this.remoteAudioMuted = false;
  }

  muteRemoteVideo(stream_id) {
    this.remoteCalls[stream_id].stream.muteVideo();
    this.remoteVideoMuted = true;
  }

  unMuteRemoteVideo(stream_id) {
    this.remoteCalls[stream_id].stream.unmuteVideo();
    this.remoteVideoMuted = false;
  }

  muteAudio() {
    // this.client.on(ClientEvent.RemoteAudioMuted, () => {
    //   console.log("audio muted");
    //   this.audioMuted = true;
    // });
    this.localStream.muteAudio();
    this.audioMuted = true;
  }

  unMuteAudio() {
    // this.client.on(ClientEvent.RemoteAudioUnmuted, () => {
    //   console.log("audio un-muted");
    //   this.audioMuted = false;
    // });
    this.localStream.unmuteAudio();
    this.audioMuted = false;
  }

  muteVideo() {
    // this.client.on(ClientEvent.RemoveVideoMuted, () => {
    //   console.log("video muted");
    //   this.videoMuted = true;
    // });
    this.localStream.muteVideo();
    this.videoMuted = true;
  }

  unMuteVideo() {
    // this.client.on(ClientEvent.RemoteVideoUnmuted, () => {
    //   console.log("video un-muted");
    //   this.videoMuted = false;
    // });

    this.localStream.unmuteVideo();
    this.videoMuted = false;
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

  removeScreenShares() {
    console.log("removescreenshare")
    //this.screenStream.stop();
    this.screenStream.close();
    this.screenShare = false;
    //this.removeRemoteStream(this.screenStream);
    this.screenUnPublish();

    this.localStream.play("agora_remote-" + this.uid);

    // this.connected = false;
    // this.published = false;
    // this.connected = false;
    // this.join();
    // this.publish();
  }

  navigatetologin() {
    localStorage.clear();
    localStorage.setItem("reload", "true");
    this.router.navigate(["/home"]);
  }

  goToMobileChat(){
    this.router.navigate(['home/mobile-chat']);
  }

  screenUnPublish() {
    this.screenClient.unpublish(this.screenStream, (error) => console.error(error));
  }

  allowUserByType(){
    // console.log(this.selectuserType);
    // let message = "ALLOW_MODERATOR" ;
    this.sendChannelMessage(this.selectuserType);
  }

  openFullscreen() {
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      /* Firefox */
      this.elem.mozRequestFullScreen();
    } else if (this.elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.elem.webkitRequestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      /* IE/Edge */
      this.elem.msRequestFullscreen();
    }
  }

  /* Close fullscreen */
  closeFullscreen() {
    if (this.document.exitFullscreen) {
      this.document.exitFullscreen();
    } else if (this.document.mozCancelFullScreen) {
      /* Firefox */
      this.document.mozCancelFullScreen();
    } else if (this.document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      this.document.webkitExitFullscreen();
    } else if (this.document.msExitFullscreen) {
      /* IE/Edge */
      this.document.msExitFullscreen();
    }
  }

}
