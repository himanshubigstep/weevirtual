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

declare var $: any;

@Component({
  selector: 'app-session-room',
  templateUrl: './session-room.component.html',
  styleUrls: ['./session-room.component.scss']
})
export class SessionRoomComponent implements OnInit {
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
  /**
   * App ID used when connecting to the Agora.io servers
   */
  appId = "bc77dbe489d5466bb0084e0ff147ab9f";
  /**
   * Channel (meeting room) within the Agora app to join
   */
  channel = "sessionRoom";
  /**
   * Generated user ID that is attached to the local client when joining a meeting room
   */
  uid: number;
  screenClientJoined = false;

  enableLiveCountShow = false;

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

  screenShareDiv: string = "agora_screen";

  constructor(
    private agoraService: NgxAgoraService,
    public  chatServeice: ChatService,
    private eventService: EventService,
    private router: Router,
    private title: Title,
    private meta: Meta,
    public dialog: MatDialog,
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
    
    this.pauseResumeRemoteStreams()

    //this.join();

    let uType:any = localStorage.getItem('currentUser');
    this.userType = JSON.parse(uType);
    //console.log(this.userType.type);

    if(localStorage.getItem("enableAttendeeCount") == "yes"){
      this.enableLiveCountShow = true;
    }

    // RTM 
    this.isReady = false ;
    this.rtmClient  = AgoraRTM.createInstance(this.appId); 
    this.rtmChannel = this.rtmClient.createChannel('RTMChannel');
    this.channelEmitter = new EventEmitter();

    console.log(this.rtmClient);
    console.log('rtm client working');
    this.assignRtmHandlers();
    this.assignRtmChannelEmitterHandlers();

    // RTM LOGIN
    this.rtmLogin();

  }
    elem;

  ngOnInit() {
    this.elem = document.documentElement;
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

    this.userRole = (localStorage.getItem("userRole")!=null) ? localStorage.getItem("userRole") : null;

    if(this.userRole == null){
      this.router.navigate(["/home/lounge/"]);
    }

    if (
      this.userDetails.user_details.user_type != "audience" &&
      this.userDetails.user_details.user_type != "attendee"
    ) {
      console.log("hlwownstream")
      this.screenShareDivID = "agora_remote-session-screen-" + this.uid;
      this.remoteCalls.push({
        divId: "agora_remote-session" + this.uid,
        userName: this.userDetails.user_details.name,
        designation: this.userDetails.user_details.designation,
        stream: '',
        remoteAudioMuted: false,
        remoteVideoMuted: false
      });
    }

    this.getMeetingChat(this.userDetails.event_details.id);

    // SEO Meta Tags
    this.title.setTitle('Meeting Hall | Leaders Of Tomorrow - Season 8 | Largest Entrepreneurship Platform | ET NOW');
    this.meta.addTags([
      { name: 'description', content: 'Session On Technology and Innovation for Sustainability. Leaders of Tomorrow - Season 8, the most comprehensive enabling platform for small businesses.' },
    ]);
    
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

   pauseResumeRemoteStreams(){

    if(localStorage.getItem("muteRemoteSessionVideo")!=null && JSON.parse(localStorage.getItem("muteRemoteSessionVideo")).length > 0){
      this.pauseRemoteVideoStream();
    }

    if(localStorage.getItem("unMuteRemoteSessionVideo")!=null && JSON.parse(localStorage.getItem("unMuteRemoteSessionVideo")).length > 0){
      this.resumeRemoteVideoStream();
    }

    if(localStorage.getItem("muteRemoteSessionAudio")!=null && JSON.parse(localStorage.getItem("muteRemoteSessionAudio")).length > 0){
      this.pauseRemoteAudioStream();
    }

    if(localStorage.getItem("unMuteRemoteSessionAudio")!=null && JSON.parse(localStorage.getItem("unMuteRemoteSessionAudio")).length > 0){
      this.resumeRemoteAudioStream();
    }
  } 

  pauseRemoteVideoStream(){
    console.log("pauseremotesessionvideo")
    const remoteStreams = this.remoteCalls;
    for(let i = 0; i<remoteStreams.length; i++){
      remoteStreams[i].remoteVideoMuted = false
      if(remoteStreams[i].stream!='' && JSON.parse(localStorage.getItem("muteRemoteSessionVideo")).indexOf(parseInt(remoteStreams[i].stream.getId().split('_session')[0])) > -1 ){
        console.log("pausesessionvideostream"+remoteStreams[i].stream.getId())
        remoteStreams[i].stream.muteVideo();
        remoteStreams[i].remoteVideoMuted = true
      }
    }
    this.remoteCalls = remoteStreams;
    console.log(this.remoteCalls)
  }
  
  resumeRemoteVideoStream(){
    console.log("resumeremotesessionvideo")
    const remoteStreams = this.remoteCalls;
    for(let i = 0; i<remoteStreams.length; i++){
      remoteStreams[i].remoteVideoMuted = true
      if(remoteStreams[i].stream!='' && JSON.parse(localStorage.getItem("unMuteRemoteSessionVideo")).indexOf(parseInt(remoteStreams[i].stream.getId().split('_session')[0])) > -1 ){
        console.log("resumesessionvideostream"+remoteStreams[i].stream.getId())
        remoteStreams[i].remoteVideoMuted = false
        remoteStreams[i].stream.unmuteVideo();
      }
    }
    this.remoteCalls = remoteStreams
  }

  pauseRemoteAudioStream(){
    console.log("pauseremotesessionaudio")
    const remoteStreams = this.remoteCalls;
    for(let i = 0; i<remoteStreams.length; i++){
      remoteStreams[i].remoteAudioMuted = false
      console.log(remoteStreams[i].stream.getId()+"@@")
      if(remoteStreams[i].stream!='' && JSON.parse(localStorage.getItem("muteRemoteSessionAudio")).indexOf(parseInt(remoteStreams[i].stream.getId().split('_session')[0])) > -1 ){
        console.log("pausesessionaudiostream"+remoteStreams[i].stream.getId())
        remoteStreams[i].remoteAudioMuted = true
        remoteStreams[i].stream.muteAudio();
      }
    }
    this.remoteCalls = remoteStreams
    console.log(this.remoteCalls)
  }
  
  resumeRemoteAudioStream(){
    console.log("resumesessionremoteaudio")
    const remoteStreams = this.remoteCalls;
    for(let i = 0; i<remoteStreams.length; i++){
      remoteStreams[i].remoteAudioMuted = true
      if(remoteStreams[i].stream!='' && JSON.parse(localStorage.getItem("unMuteRemoteSessionAudio")).indexOf(parseInt(remoteStreams[i].stream.getId().split('_session')[0])) > -1 ){
        console.log("resumesessionaudiostream"+remoteStreams[i].stream.getId())
        remoteStreams[i].remoteAudioMuted = false
        remoteStreams[i].stream.unmuteAudio();
      }
    }
    this.remoteCalls = remoteStreams
  }

  setRemoteStreamAudioVideoMuteUnmute(message){

    if(message == 'muteAll'){ //Mute Audios of all remote streams

      if(localStorage.getItem("muteRemoteAudio")!=null){
        localStorage.removeItem("muteRemoteAudio");
      }

      if(localStorage.getItem("unMuteRemoteAudio")!=null){
        localStorage.removeItem("unMuteRemoteAudio");
      }

      localStorage.setItem("muteAll", "yes")
      
    }

    if(message == 'unMuteAll'){

      if(localStorage.getItem("muteRemoteAudio")!=null){
        localStorage.removeItem("muteRemoteAudio");
      }

      if(localStorage.getItem("unMuteRemoteAudio")!=null){
        localStorage.removeItem("unMuteRemoteAudio");
      }

      localStorage.setItem("muteAll", "no")
      
    }

    if(message.includes('yesmuteRemoteVideo')){ //Mute Remote Video

      const stream_id = parseInt(message.split("@")[1]);
      let muteVideos = (localStorage.getItem("muteRemoteVideo") != null) ? JSON.parse(localStorage.getItem("muteRemoteVideo")) : []

      if(localStorage.getItem("unMuteRemoteVideo")!=null){
        //Remove the unmuted stream from mute array
        let unmuteVideos = JSON.parse(localStorage.getItem("unMuteRemoteVideo"));
        if (unmuteVideos.indexOf(stream_id) > -1) {
          unmuteVideos.splice(unmuteVideos.indexOf(stream_id), 1);
          localStorage.setItem("unMuteRemoteVideo", JSON.stringify(unmuteVideos));
        } 
      }
      
      (muteVideos.indexOf(stream_id) == -1) ? muteVideos.push(stream_id) : null;
      localStorage.setItem("muteRemoteVideo", JSON.stringify(muteVideos));
      
    }

    if(message.includes('unMuteRemoteVideo')){ // //UnMute Remote Video

      const stream_id = parseInt(message.split("@")[1]);      
      let unMuteVideos = (localStorage.getItem("unMuteRemoteVideo") != null) ? JSON.parse(localStorage.getItem("unMuteRemoteVideo")) : []

      if(localStorage.getItem("muteRemoteVideo")!=null){
        //Remove the unmuted stream from mute array
        let muteVideos = JSON.parse(localStorage.getItem("muteRemoteVideo"));
        if (muteVideos.indexOf(stream_id) > -1) {
          muteVideos.splice(muteVideos.indexOf(stream_id), 1);
          localStorage.setItem("muteRemoteVideo", JSON.stringify(muteVideos));
        } 
      }
      (unMuteVideos.indexOf(stream_id) == -1) ? unMuteVideos.push(stream_id) : null;
      localStorage.setItem("unMuteRemoteVideo", JSON.stringify(unMuteVideos));
     
    }

    //if(localStorage.getItem("muteAll") == null || localStorage.getItem("muteAll") == "no"){
      if(message.includes('yesmuteRemoteAudio')){ //Mute Remote Audio

        if(localStorage.getItem("muteAll") == "no"){
          localStorage.removeItem("muteAll");
        }
        
        const stream_id = parseInt(message.split("@")[1]);

        let muteAudios = (localStorage.getItem("muteRemoteAudio") != null) ? JSON.parse(localStorage.getItem("muteRemoteAudio")) : []

        if(localStorage.getItem("unMuteRemoteAudio")!=null){
          //Remove the unmuted stream from mute array
          let unmuteAudios = JSON.parse(localStorage.getItem("unMuteRemoteAudio"));
          if (unmuteAudios.indexOf(stream_id) > -1) {
            unmuteAudios.splice(unmuteAudios.indexOf(stream_id), 1);
            localStorage.setItem("unMuteRemoteAudio", JSON.stringify(unmuteAudios));
          } 
        }

        (muteAudios.indexOf(stream_id) == -1) ? muteAudios.push(stream_id) : null;
        localStorage.setItem("muteRemoteAudio", JSON.stringify(muteAudios));
        
      }
    //}
      
    if(message.includes('unMuteRemoteAudio')){ // //UnMute Remote Audio

      const stream_id = parseInt(message.split("@")[1]);
      let unMuteAudios = (localStorage.getItem("unMuteRemoteAudio") != null) ? JSON.parse(localStorage.getItem("unMuteRemoteAudio")) : []

      if(localStorage.getItem("muteRemoteAudio")!=null){
        let muteAudios = JSON.parse(localStorage.getItem("muteRemoteAudio"));
        if (muteAudios.indexOf(stream_id) > -1) {
          muteAudios.splice(muteAudios.indexOf(stream_id), 1);
          localStorage.setItem("muteRemoteAudio", JSON.stringify(muteAudios));
        }
      }
      
      (unMuteAudios.indexOf(stream_id) == -1) ? unMuteAudios.push(stream_id) : null;
      localStorage.setItem("unMuteRemoteAudio", JSON.stringify(unMuteAudios));
      
    }
    
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

      this.setRemoteStreamAudioVideoMuteUnmute(message);

      this.channelEmitter.emit(`${message}`, message);
    });

  }

  private assignRtmChannelEmitterHandlers():void{
      
      this.channelEmitter.on('joinedChannel', () => {
        this.isReady = true;
        console.log("Channel emitter work fine");
        this.sendChannelMessage('helloworld');
      });

      this.channelEmitter.on(`speaker-lounge-on`, function ( {content}) {
       
        // ALLOW SPEAKER LOUNGE TO JOIN CALL

        console.log("speakerloungeon");
        localStorage.setItem("enableSpeakerLounge", "yes");

      });

      this.channelEmitter.on(`speaker-lounge-off`, function ( {content}) {
        
        // DISALLOW SPEAKER LOUNGE TO JOIN CALL
        console.log("speakerloungeoff");
        localStorage.setItem("enableSpeakerLounge", "no");
      });

      this.channelEmitter.on(`join-now-on`, function ( {content}) {
       
        // ALLOW JOIN NOW TO JOIN CALL

        console.log("joinnowon");
        localStorage.setItem("enableJoinNow", "yes");

      });

      this.channelEmitter.on(`join-now-off`, function ( {content}) {
        
        // DISALLOW JOIN NOW TO JOIN CALL
        console.log("joinnowoff");
        localStorage.setItem("enableJoinNow", "no");
        
      });

      this.channelEmitter.on(`attendee-count-on`, function ( {content}) {
       
        // ALLOW JOIN NOW TO JOIN CALL

        console.log("attendeecounton");
        localStorage.setItem("enableAttendeeCount", "yes");
        this.enableLiveCountShow = true;
      });

      this.channelEmitter.on(`attendee-count-off`, function ( {content}) {
        
        // DISALLOW JOIN NOW TO JOIN CALL
        console.log("attendeecountoff");
        localStorage.setItem("enableAttendeeCount", "no");
        this.enableLiveCountShow = false;
      });

      this.channelEmitter.on(`join-session-room-on`, function ( {content}) {
       
        // ALLOW SESSION ROOM TO JOIN CALL
        console.log("joinsessionroomon");
        localStorage.setItem("enableSessionStreaming", "yes");
      });

      this.channelEmitter.on(`join-session-room-off`, function ( {content}) {
        
        // DISALLOW SESSION ROOM TO JOIN CALL
        console.log("joinsessionroomoff");
        localStorage.setItem("enableSessionStreaming", "no");
      });
  }

  private rtmLogin(){

    this.rtmClient.login({ token: null, uid: this.uid.toString() } ).then(() => {
      console.log('AgoraRTM client login success');
      
      this.join()

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
      console.log("hlwcurrentuser")
      console.log(this.totalUsersList);
      console.log(this.panellistUsersList)
      
      console.log(stream.getId())
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
          console.log("addremotestream")
          this.remoteCalls.push({
            divId: id,
            // userName: selectedObj.full_name,
            // designation: selectedObj.designation,
            userName: "",
            designation: "",
            stream: stream,
            remoteAudioMuted: false,
            remoteVideoMuted: false,
          });
        }

        setTimeout(() => stream.play(id), 1000);

        this.pauseResumeRemoteStreams();

      //}
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
        stream.close();
        
        this.removeRemoteStream(stream);

        const removeClientStreamId = `${this.getRemoteId(stream)}`;
        
        this.totalUsersList = this.totalUsersList.filter(
          (call) => call !== removeClientStreamId
        );
        console.log(`${evt.uid} left from this channel screenclient`);
      }
    });

    // this.screenClient.on(ClientEvent.RemoteStreamSubscribed, (evt) => {
    //   console.log("session stream subscribed")
    // });

    this.screenClient.on(ClientEvent.RemoteStreamAdded, (evt) => {
      var stream = evt.stream;
      this.screenClient.subscribe(stream);
    });

    // this.screenClient.on(ClientEvent.RemoteStreamAdded, (evt) => {
    //   console.log("hlwsessionsubscribe")
    //   const stream = evt.stream as Stream;
    //   console.log(stream.getId());
    //   this.screenClient.subscribe(stream)
    // });

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
          this.client.join(null, this.channel, this.uid+'_session', (uid) => {
            console.log("User " + uid + " join channel successfully")

            this.assignClientHandlers()

            this.client.setClientRole(this.userRole, () => {
              console.log("client role changed");
            });

            this.localStream = this.agoraService.createStream({
              streamID: this.uid+'_session',
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
        console.log("this.userRole"+this.userRole)
        if(this.userRole=='host'){
          console.log("publishstream")
          this.publish();
        }

        if (
          this.userDetails.user_details.user_type != "audience" &&
          this.userDetails.user_details.user_type != "attendee"
        ) {
          this.localStream.play("agora_remote-session" + this.uid);
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
          // this.remoteCalls = [];
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
   
    var userID = this.uid+'-session-screen'; // set to null to auto generate uid on successfull connection

    if(!this.screenClientJoined){
      this.screenClient.init(
        this.appId,
        () => { 
          console.log("screen Initialized successfully") 
          this.screenClient.join(null, this.channel , userID, (uid) => {
            console.log(
              'screen client join channel: ' + this.channel + ' success, uid: ' + uid
            )
            
            // this.screenClient.setClientRole(this.userRole, () => {
            //   console.log("client role changed");
            // });

            this.screenClientJoined = true;
            this.initScreenShare()
          })
        },
        () => console.log("screen Could not initialize")
      );
    }
    else{
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
    //     this.totalUsersList.push("agora_remote-session-screen" + this.uid);
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
        streamID: this.uid + "_session_screen",
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
        const user_id = this.uid+'_session_screen';
        console.log("screestream"+user_id)
        console.log(this.screenStream)
        console.log(this.screenStream['params'].streamID)
        if(user_id != this.screenStream['params'].streamID){
          console.log("playscreenstream")
          this.screenStream.play("agora_remote-session" + this.uid);
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
    return `agora_remote-session${stream.getId()}`;
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

    this.localStream.play("agora_remote-session" + this.uid);

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
