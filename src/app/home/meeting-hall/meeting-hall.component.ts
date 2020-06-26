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
import { LiverecordingComponent } from "src/app/home/meeting-hall/dailog/liverecording/liverecording.component";
import { ImagepreviewComponent } from "src/app/home/meeting-hall/dailog/imagepreview/imagepreview.component";
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from 'src/app/shared/services/http.service';
import { RecordingService } from '../../shared/services/recording.service';
import { environment } from "../../../environments/environment";

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
  private sessionLocalStream: Stream;
  private client: AgoraClient;
  private sessionClient: AgoraClient;
  private screenClient: AgoraClient;
  public question: Chatbox;
  public questionList;
  public userDetails: any;
  private rtmClient;
  private rtmChannel;
  private channelEmitter;
  private isReady ;
  recordingSid;
  recordingResourceId;

  panellistUsersList = [];
  totalUsersList = [];
  userType:any;
  selectuserType: String;

  enableSessionStreaming = false;
  enableJoinNowToggle = false;
  enableJoinSessionToggle = false;
  enableJoinSpeakerLoungeToggle = false;
  enableAttendeeCountToggle = false;

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
  channel = "speakerLounge";
  sessionChannel = "sessionRoom";
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
  sessionConnected = false;
  screenShareDivID: String;
  /**
   * Whether the local client's A/V stream has been published to the remote meeting room
   */
  published = false;

  userRole: any = "audience"; // to set user role as host or audience

  audioMuted = false;
  videoMuted = false;
  MuteAll = false;

  remoteAudioMuted = false;
  remoteVideoMuted= false;

  screenShareDiv: string = "agora_screen";

  remoteSessionCalls: any[] = [];

  constructor(
    private agoraService: NgxAgoraService,
    public  chatServeice: ChatService,
    public  httpservice: HttpService,
    private eventService: EventService,
    private recordingService: RecordingService,
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
    this.recordingSid = localStorage.getItem('recordingSid') || null;
    this.recordingResourceId = localStorage.getItem('recordingResourceId') || null;

    this.client = this.agoraService.createClient({
      mode: "live",
      codec: "h264",
    });
    //this.assignClientHandlers();

    this.sessionClient = this.agoraService.createClient({
      mode: "live",
      codec: "h264",
    });

    this.screenClient = this.agoraService.createClient({
      mode: "rtc",
      codec: "vp8",
    });
    //this.assignScreenClientHandlers();
	
	if(localStorage.getItem("enableJoinNow") == "yes"){
      this.enableJoinNowToggle = true;
    }

    if(localStorage.getItem("enableSpeakerLounge") == "yes"){
      this.enableJoinSpeakerLoungeToggle = true;
    }
	
	if(localStorage.getItem("enableAttendeeCount") == "yes"){
      this.enableAttendeeCountToggle = true;
    }

    if(localStorage.getItem("enableSessionStreaming") == "yes"){
      this.enableSessionStreaming = true;
    }
    
    this.pauseResumeRemoteStreams()

    //this.join();

    let uType:any = localStorage.getItem('currentUser');
    this.userType = JSON.parse(uType);
    //console.log(this.userType.type);

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
  mediaList: any;

  isSessionClient = false;
  uploadImages = []

  ngOnInit() {
    this.elem = document.documentElement;

    this.httpservice.get(
      `events/media-upload/` + 1
    ).subscribe(result => {
      this.mediaList = result;
      console.log(result);
      for (let index = 0; index < this.mediaList.background_images.length; index++) {
        let element:any = this.mediaList.background_images[index].split('/');
        this.uploadImages.push(element[element.length-1]);
        
      }
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

    this.userRole = "host";

    this.getMeetingChat(this.userDetails.event_details.id);

    // SEO Meta Tags
    this.title.setTitle('Meeting Hall | Leaders Of Tomorrow - Season 8 | Largest Entrepreneurship Platform | ET NOW');
    this.meta.addTags([
      { name: 'description', content: 'Session On Technology and Innovation for Sustainability. Leaders of Tomorrow - Season 8, the most comprehensive enabling platform for small businesses.' },
    ]);
    
  }

  playSelfStream(stream_type){
    if (
      this.userDetails.user_details.user_type != "audience" &&
      this.userDetails.user_details.user_type != "attendee"
    ) {
      console.log("isSessionClient"+this.isSessionClient)
      this.screenShareDivID = "agora_remote-screen-" + this.uid;

      if(stream_type=='session'){
        this.screenShareDivID = "agora_remote-session-screen-" + this.uid;
        this.remoteSessionCalls.push({
          divId: "agora_remote-session-" + this.uid,
          userName: this.userDetails.user_details.name,
          designation: this.userDetails.user_details.designation,
          stream: '',
          remoteAudioMuted: false,
          remoteVideoMuted: false
        });
      }else{
        this.screenShareDivID = "agora_remote-screen-" + this.uid;
        this.remoteCalls.push({
          divId: "agora_remote-" + this.uid,
          userName: this.userDetails.user_details.name,
          designation: this.userDetails.user_details.designation,
          stream: '',
          remoteAudioMuted: false,
          remoteVideoMuted: false
        });
      }

      // if(this.userDetails.user_details.user_type!='admin'){
      //   this.userRole = 'audience';
      // }
      console.log(this.userDetails.user_details.user_type)
      console.log("userrole"+this.userRole)
      
    }
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

  startRecording() {
    if( this.recordingSid ) {
      this.stopRecording();
      return;
    }
    this.recordingService.acquire(this.channel, this.uid, this.appId ).subscribe(response => {
      if (response.resourceId) {
        this.recordingResourceId = response.resourceId;
        localStorage.setItem('recordingResourceId', response.resourceId);
        this.recordingService.start(this.channel, this.uid, this.appId, response.resourceId, this.individualHd, this.individualHdPlus ).subscribe(response => {
          if (response?.sid) {
            this.recordingSid = response.sid;
            localStorage.setItem('recordingSid', response.sid);
          }
        }, (error => {
          console.log(error)
          // Need to handle error
        }));
      }
    }, (error => {
      console.log(error)
      // Need to handle error
    }));
  }

  stopRecording() {
    this.recordingService.stop(this.channel, this.uid, this.appId, this.recordingResourceId, this.recordingSid).subscribe(response => {
      if (response?.sid) {
        localStorage.removeItem('recordingSid');
        localStorage.removeItem('recordingResourceId');
        this.recordingSid = null;
        this.recordingResourceId = null;
      }
    }, (error => {
      console.log(error)
      localStorage.removeItem('recordingSid');
      localStorage.removeItem('recordingResourceId');
      this.recordingSid = null;
      this.recordingResourceId = null;
    }));
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

  downloadrecording(): void {
    const dialogRef = this.dialog.open(LiverecordingComponent, {
      width: 'auto',
       //data: {name: this.name, animal: this.animal}
     });

     dialogRef.afterClosed().subscribe(result => {
       console.log('The dialog was closed');
       //this.animal = result;
     });
  }

  imagepreview(): void {
    const dialogRef = this.dialog.open(ImagepreviewComponent, {
      width: 'auto',
       //data: {name: this.name, animal: this.animal}
     });

     dialogRef.afterClosed().subscribe(result => {
       console.log('The dialog was closed');
       //this.animal = result;
     });
  }

  pauseResumeRemoteStreams(){
    if(localStorage.getItem("muteAll") == "yes"){
      this.pauseAllRemoteAudioStreams()
    }

    if(localStorage.getItem("muteAll") == "no"){
      this.resumeAllRemoteAudioStreams()
    }

    if(localStorage.getItem("muteRemoteVideo")!=null && JSON.parse(localStorage.getItem("muteRemoteVideo")).length > 0){
      this.pauseRemoteVideoStream();
    }

    if(localStorage.getItem("unMuteRemoteVideo")!=null && JSON.parse(localStorage.getItem("unMuteRemoteVideo")).length > 0){
      this.resumeRemoteVideoStream();
    }

    if(localStorage.getItem("muteRemoteAudio")!=null && JSON.parse(localStorage.getItem("muteRemoteAudio")).length > 0){
      this.pauseRemoteAudioStream();
    }

    if(localStorage.getItem("unMuteRemoteAudio")!=null && JSON.parse(localStorage.getItem("unMuteRemoteAudio")).length > 0){
      this.resumeRemoteAudioStream();
    }

  }

  pauseRemoteVideoStream(){
    console.log("pauseremotevideo")
    const remoteStreams = this.remoteCalls;
    for(let i = 0; i<remoteStreams.length; i++){
      remoteStreams[i].remoteVideoMuted = false
      if(remoteStreams[i].stream!='' && JSON.parse(localStorage.getItem("muteRemoteVideo")).indexOf(remoteStreams[i].stream.getId()) > -1 ){
        console.log("pausevideostream"+remoteStreams[i].stream.getId())
        remoteStreams[i].stream.muteVideo();
        remoteStreams[i].remoteVideoMuted = true
      }
    }
    this.remoteCalls = remoteStreams;
    console.log(this.remoteCalls)
  }
  
  resumeRemoteVideoStream(){
    console.log("resumeremotevideo")
    const remoteStreams = this.remoteCalls;
    for(let i = 0; i<remoteStreams.length; i++){
      remoteStreams[i].remoteVideoMuted = true
      if(remoteStreams[i].stream!='' && JSON.parse(localStorage.getItem("unMuteRemoteVideo")).indexOf(remoteStreams[i].stream.getId()) > -1 ){
        console.log("resumevideostream"+remoteStreams[i].stream.getId())
        remoteStreams[i].remoteVideoMuted = false
        remoteStreams[i].stream.unmuteVideo();
      }
    }
    this.remoteCalls = remoteStreams
  }

  pauseAllRemoteAudioStreams(){
    console.log("pauseallremoteaudios")
    const remoteStreams = this.remoteCalls;
    for(let i = 0; i<remoteStreams.length; i++){
      if(remoteStreams[i].stream!=''){
        remoteStreams[i].remoteAudioMuted = true;
        if(localStorage.getItem("unMuteRemoteAudio")!=null && JSON.parse(localStorage.getItem("unMuteRemoteAudio")).indexOf(remoteStreams[i].stream.getId()) == -1 ){
          console.log("resumeaudiostream"+remoteStreams[i].stream.getId())
          console.log("unmuteaudio")
          remoteStreams[i].stream.muteAudio();
          remoteStreams[i].remoteAudioMuted = false;
        }        
      }
    }
    this.remoteCalls = remoteStreams;
    console.log(this.remoteCalls)
  }
  
  resumeAllRemoteAudioStreams(){
    console.log("resumeallremoteaudios")
    const remoteStreams = this.remoteCalls;
    for(let i = 0; i<remoteStreams.length; i++){
      if(remoteStreams[i].stream!=''){
        remoteStreams[i].stream.unmuteAudio();
        remoteStreams[i].remoteAudioMuted = false;
      }
    }
    this.remoteCalls = remoteStreams
  }

  pauseRemoteAudioStream(){
    console.log("pauseremoteaudio")
    const remoteStreams = this.remoteCalls;
    for(let i = 0; i<remoteStreams.length; i++){
      remoteStreams[i].remoteAudioMuted = false
      if(remoteStreams[i].stream!='' && JSON.parse(localStorage.getItem("muteRemoteAudio")).indexOf(remoteStreams[i].stream.getId()) > -1 ){
        console.log("pauseaudiostream"+remoteStreams[i].stream.getId())
        remoteStreams[i].remoteAudioMuted = true
        remoteStreams[i].stream.muteAudio();
      }
    }
    this.remoteCalls = remoteStreams
    console.log(this.remoteCalls)
  }
  
  resumeRemoteAudioStream(){
    console.log("resumeremoteaudio")
    const remoteStreams = this.remoteCalls;
    for(let i = 0; i<remoteStreams.length; i++){
      remoteStreams[i].remoteAudioMuted = true
      if(remoteStreams[i].stream!='' && JSON.parse(localStorage.getItem("unMuteRemoteAudio")).indexOf(remoteStreams[i].stream.getId()) > -1 ){
        console.log("resumeaudiostream"+remoteStreams[i].stream.getId())
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
      this.pauseAllRemoteAudioStreams()
    }

    if(message == 'unMuteAll'){

      if(localStorage.getItem("muteRemoteAudio")!=null){
        localStorage.removeItem("muteRemoteAudio");
      }

      if(localStorage.getItem("unMuteRemoteAudio")!=null){
        localStorage.removeItem("unMuteRemoteAudio");
      }

      localStorage.setItem("muteAll", "no")
      this.resumeAllRemoteAudioStreams()
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
      this.pauseRemoteVideoStream();
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
      this.resumeRemoteVideoStream();
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
        this.pauseRemoteAudioStream();
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
      this.resumeRemoteAudioStream();
    }

    this.handleRemoteSessionsMuteUnmute(message);
    
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
        //this.sendChannelMessage('helloworld');
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

      this.channelEmitter.on(`join-session-room-on`, function ( {content}) {
       
        // ALLOW SESSION ROOM TO JOIN CALL
        console.log("joinsessionroomon");

        this.enableSessionStreaming = true;
        localStorage.setItem("enableSessionStreaming", "yes");
        location.reload();
      });

      this.channelEmitter.on(`join-session-room-off`, function ( {content}) {
        
        // DISALLOW SESSION ROOM TO JOIN CALL
        console.log("joinsessionroomoff");
        this.enableSessionStreaming = false;
        localStorage.setItem("enableSessionStreaming", "no");
        location.reload();
        
      });
	  
	  this.channelEmitter.on(`attendee-count-on`, function ( {content}) {
       
        // ALLOW JOIN NOW TO JOIN CALL

        console.log("attendeecounton");
        localStorage.setItem("enableAttendeeCount", "yes");
      });

      this.channelEmitter.on(`attendee-count-off`, function ( {content}) {
        
        // DISALLOW JOIN NOW TO JOIN CALL
        console.log("attendeecountoff");
        localStorage.setItem("enableAttendeeCount", "no");
      });
	  
  }

  private rtmLogin(){

    this.rtmClient.login({ token: null, uid: this.uid.toString() } ).then(() => {
      console.log('AgoraRTM client login success');
      this.join(); //Join Speaker Lounge Channel
      if(this.userDetails.user_details.user_type == 'admin'){
        console.log("hlwjoinsession")
        this.joinSession(); //Join Session Room Channel
      }
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
  
  setRoomControls(message){
    if(message == 'join-now-on'){
      localStorage.setItem("enableJoinNow", "yes");
    }
    if(message == 'join-now-off'){
      localStorage.setItem("enableJoinNow", "no");
    }
    if(message == 'speaker-lounge-on'){
      localStorage.setItem("enableSpeakerLounge", "yes");
    }
    if(message == 'speaker-lounge-off'){
      localStorage.setItem("enableSpeakerLounge", "no");
    }
    if(message == 'attendee-count-on'){
      localStorage.setItem("enableAttendeeCount", "yes");
    }
    if(message == 'attendee-count-off'){
      localStorage.setItem("enableAttendeeCount", "no");
    }
    if(message== 'join-session-room-on'){
      localStorage.setItem("enableSessionStreaming", "yes");
    }
    if(message== 'join-session-room-off'){
      localStorage.setItem("enableSessionStreaming", "no");
    }
  }

  private sendChannelMessage(message){
    if (!this.isReady) {
      console.log("user not logged in channel");
      return;
    }
    this.rtmChannel.sendMessage({  text: `${message}` }).then(() => {
      console.log("channel message-send success"+message) ;
      this.setRemoteStreamAudioVideoMuteUnmute(message)
	  this.setRoomControls(message)
    }).catch(error => {
      console.log("channel message-send failure") ;
      console.log(error)
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
        console.log(`${evt.uid} left from this channel screenclient`);
      }
    });

    // this.screenStream.on("stopScreenSharing", () => {
    //  console.log("Stop Screen Sharing at" + new Date());
    // });

  }

  join(): void {

    this.playSelfStream('')

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
          console.log("console.log(this.panellistUsersList)")
          console.log(console.log(this.panellistUsersList))
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
    this.sendChannelMessage('yesmuteRemoteAudio@'+this.remoteCalls[stream_id].stream.getId());
    // this.remoteCalls[stream_id].stream.muteAudio();
    //this.sendChannelMessage('yesmuteRemoteAudio@'+14);
    this.remoteAudioMuted = true;
  }

  unRemoteMuteAudio(stream_id) {
    this.sendChannelMessage('unMuteRemoteAudio@'+this.remoteCalls[stream_id].stream.getId())
    // this.remoteCalls[stream_id].stream.unmuteAudio();
    //this.sendChannelMessage('unMuteRemoteAudio@'+14)
    this.remoteAudioMuted = false;
  }

  muteRemoteVideo(stream_id) {
    this.sendChannelMessage('yesmuteRemoteVideo@'+this.remoteCalls[stream_id].stream.getId());
    //this.sendChannelMessage('yesmuteRemoteVideo@'+14);
    //this.remoteCalls[stream_id].stream.muteVideo();
    this.remoteVideoMuted = true;
  }

  unMuteRemoteVideo(stream_id) {
    this.sendChannelMessage('unMuteRemoteVideo@'+this.remoteCalls[stream_id].stream.getId())
    //this.sendChannelMessage('unMuteRemoteVideo@'+14)
    //this.remoteCalls[stream_id].stream.unmuteVideo();
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

  muteAll(){
    console.log("yesmuteall")
    this.sendChannelMessage('muteAll')
    this.MuteAll = true;
  }

  unMuteAll(){
    this.sendChannelMessage('unMuteAll')
    this.MuteAll = false;
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

  navigateToSessionRoom(){
    this.unpublish();
    console.log("after unpublish")
    this.localStream.stop();
    this.localStream.close();
    this.removeRemoteStream(this.localStream);
    this.remoteCalls = [];
    localStorage.setItem("userRole", "host");
    this.router.navigate(["/home/session-room"]);
  }

  goToMobileChat(){
    this.router.navigate(['home/mobile-chat']);
  }

  screenUnPublish() {
    this.screenClient.unpublish(this.screenStream, (error) => console.error(error));
  }

  handleRoomControl(event, control){
    console.log("handleroomcontrol")
    let msg = '';
    if(event.checked){
      msg = control+'-on';
      console.log("event on")
    }else{
      msg = control+'-off';
      console.log("event off")
    }
    this.sendChannelMessage(msg)
  }

  allowUserByType(){
    // console.log(this.selectuserType);
    // let message = "ALLOW_MODERATOR" ;
    //this.sendChannelMessage(this.selectuserType);
  }

  //Session Rooms Handles
  joinSession(): void {

    this.playSelfStream('session')

    if (!this.connected) {
      
      this.sessionClient.init(
        this.appId,
        () => {
          console.log("Session Initialized successfully") 
          this.sessionClient.join(null, this.sessionChannel, this.uid+'_session', (uid) => {
            console.log("User " + uid + " join channel successfully")

            this.assignSessionClientHandlers()

            this.sessionClient.setClientRole(this.userRole, () => {
              console.log("session client role changed");
            });

            this.sessionLocalStream = this.agoraService.createStream({
              streamID: this.uid+'_session',
              audio: true,
              video: true,
              screen: false,
            });

            this.assignSessionLocalStreamHandlers();

            this.initSession();
            
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


  private assignSessionLocalStreamHandlers(): void {
    // The user has granted access to the camera and mic.
    this.sessionLocalStream.on(StreamEvent.MediaAccessAllowed, () => {
      console.log("accessAllowed");
    });
    // The user has denied access to the camera and mic.
    this.localStream.on(StreamEvent.MediaAccessDenied, () => {
      console.log("accessDenied");
    });
  }
  

  removeRemoteSessionStream = (stream) => {
    const removeClientStreamId = `${this.getSessionRemoteId(stream)}`;
    this.remoteSessionCalls = this.remoteSessionCalls.filter(
      (call) => call.divId !== removeClientStreamId
    );
  }

  protected initSession(): void {
    this.sessionLocalStream.init(
      () => {
        // The user has granted access to the camera and mic.
        console.log("getUserMedia successfully");

        if(this.userRole=='host'){
          this.publishSession();
        }

        if (
          this.userDetails.user_details.user_type != "audience" &&
          this.userDetails.user_details.user_type != "attendee"
        ) {
          this.isSessionClient = true;
          this.sessionLocalStream.play("agora_remote-session-" + this.uid);
        }
        this.connected = true;
      },
      (err) => console.log("getUserMedia failed", err)
    );
  }

  private getSessionRemoteId(stream: Stream): string {
    console.log(stream.getId());
    return `agora_remote-session${stream.getId()}`;
  }

  publishSession(): void {
    this.sessionClient.publish(this.localStream, (err) =>
      console.log("Publish session local stream error: " + err)
    );
  }

  private assignSessionClientHandlers(): void {

    console.log("hlwassignclient")
    console.log(ClientEvent)
    this.sessionClient.on(ClientEvent.LocalStreamPublished, (evt) => {
      this.published = true;
      console.log("Publish local session stream successfully");
    });

    this.sessionClient.on(ClientEvent.Error, (error) => {
      console.log("Got error msg:", error.reason);
      if (error.reason === "DYNAMIC_KEY_TIMEOUT") {
        this.sessionClient.renewChannelKey(
          "",
          () => console.log("Renewed the channel key successfully."),
          (renewError) =>
            console.error("Renew channel key failed: ", renewError)
        );
      }
    });

    this.sessionClient.on(ClientEvent.RemoteStreamAdded, (evt) => {
      console.log("hlwsessionsubscribe")
      const stream = evt.stream as Stream;
      this.sessionClient.subscribe(stream, { audio: true, video: true }, (err) => {
        console.log("Subscribe stream failed", err);
      });
    });

    this.sessionClient.on(ClientEvent.RemoteStreamSubscribed, (evt) => {
      console.log("session stream subscribed")
      const stream = evt.stream as Stream;
      const id = this.getSessionRemoteId(stream);

      this.totalUsersList.push(id);
      // const selectedObj = true;
      console.log("hlwsessioncurrentuser")
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
        //if((typeof this.screenStream== 'undefined') || (stream.getId()!=this.screenStream.getId())){
          this.remoteSessionCalls.push({
            divId: id,
            // userName: selectedObj.full_name,
            // designation: selectedObj.designation,
            userName: "",
            designation: "",
            stream: stream,
            remoteAudioMuted: false,
            remoteVideoMuted: false,
          });
        //}

        setTimeout(() => stream.play(id), 1000);

        this.pauseResumeSessionRemoteStreams()

      //}
    });

    this.sessionClient.on(ClientEvent.RemoteStreamRemoved, (evt) => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        stream.close();
        this.removeRemoteSessionStream(stream);
        //this.remoteCalls = [];
        console.log(`Remote stream is removed ${stream.getId()}`);
      }
    });

    this.sessionClient.on(ClientEvent.PeerLeave, (evt) => {
      const stream = evt.stream as Stream;
      if (stream) {
        console.log(this.remoteSessionCalls)
        console.log(stream['params'].streamID)
        //this.destroy();
        stream.stop();
        stream.close();
        
        this.removeRemoteSessionStream(stream);

        const removeClientStreamId = `${this.getSessionRemoteId(stream)}`;
        
        this.totalUsersList = this.totalUsersList.filter(
          (call) => call !== removeClientStreamId
        );
        console.log(`${evt.uid} left from this channel localclient`);
        console.log(`${this.getSessionRemoteId(stream)}`)
        console.log("this.remoteSessionCalls")
        console.log(this.remoteSessionCalls)
      }
    });
  }

  muteRemoteSessionAudio(stream_id){
    this.sendChannelMessage('yesmuteRemoteSessionAudio@'+this.remoteSessionCalls[stream_id].stream.getId());
    this.remoteAudioMuted = true;
  }

  unRemoteMuteSessionAudio(stream_id) {
    this.sendChannelMessage('unMuteRemoteSessionAudio@'+this.remoteSessionCalls[stream_id].stream.getId())
    this.remoteAudioMuted = false;
  }

  muteRemoteSessionVideo(stream_id) {
    this.sendChannelMessage('yesmuteRemoteSessionVideo@'+this.remoteSessionCalls[stream_id].stream.getId());
    this.remoteVideoMuted = true;
  }

  unMuteRemoteSessionVideo(stream_id) {
    this.sendChannelMessage('unMuteRemoteSessionVideo@'+this.remoteSessionCalls[stream_id].stream.getId())
    this.remoteVideoMuted = false;
  }

  pauseResumeSessionRemoteStreams(){
    //Handle session streams
    if(localStorage.getItem("muteRemoteSessionVideo")!=null && JSON.parse(localStorage.getItem("muteRemoteSessionVideo")).length > 0){
      this.pauseRemoteSessionVideoStream();
    }

    if(localStorage.getItem("unMuteRemoteSessionVideo")!=null && JSON.parse(localStorage.getItem("unMuteRemoteSessionVideo")).length > 0){
      this.resumeRemoteSessionVideoStream();
    }

    if(localStorage.getItem("muteRemoteSessionAudio")!=null && JSON.parse(localStorage.getItem("muteRemoteSessionAudio")).length > 0){
      this.pauseRemoteSessionAudioStream();
    }

    if(localStorage.getItem("unMuteRemoteSessionAudio")!=null && JSON.parse(localStorage.getItem("unMuteRemoteSessionAudio")).length > 0){
      this.resumeRemoteSessionAudioStream();
    }
  }

  handleRemoteSessionsMuteUnmute(message) {
    if(message.includes('yesmuteRemoteSessionVideo')){ //Mute Remote Video

      const stream_id = parseInt(message.split("@")[1]);
      let muteVideos = (localStorage.getItem("muteRemoteSessionVideo") != null) ? JSON.parse(localStorage.getItem("muteRemoteSessionVideo")) : []

      if(localStorage.getItem("unMuteRemoteSessionVideo")!=null){
        //Remove the unmuted stream from mute array
        let unmuteVideos = JSON.parse(localStorage.getItem("unMuteRemoteSessionVideo"));
        if (unmuteVideos.indexOf(stream_id) > -1) {
          unmuteVideos.splice(unmuteVideos.indexOf(stream_id), 1);
          localStorage.setItem("unMuteRemoteSessionVideo", JSON.stringify(unmuteVideos));
        } 
      }
      
      (muteVideos.indexOf(stream_id) == -1) ? muteVideos.push(stream_id) : null;
      localStorage.setItem("muteRemoteSessionVideo", JSON.stringify(muteVideos));
      this.pauseRemoteSessionVideoStream();
    }

    if(message.includes('unMuteRemoteSessionVideo')){ // //UnMute Remote Video

      const stream_id = parseInt(message.split("@")[1]);      
      let unMuteVideos = (localStorage.getItem("unMuteRemoteSessionVideo") != null) ? JSON.parse(localStorage.getItem("unMuteRemoteSessionVideo")) : []

      if(localStorage.getItem("muteRemoteVideo")!=null){
        //Remove the unmuted stream from mute array
        let muteVideos = JSON.parse(localStorage.getItem("muteRemoteVideo"));
        if (muteVideos.indexOf(stream_id) > -1) {
          muteVideos.splice(muteVideos.indexOf(stream_id), 1);
          localStorage.setItem("muteRemoteSessionVideo", JSON.stringify(muteVideos));
        } 
      }
      (unMuteVideos.indexOf(stream_id) == -1) ? unMuteVideos.push(stream_id) : null;
      localStorage.setItem("unMuteRemoteSessionVideo", JSON.stringify(unMuteVideos));
      this.resumeRemoteSessionVideoStream();
    }

    //if(localStorage.getItem("muteAll") == null || localStorage.getItem("muteAll") == "no"){
      if(message.includes('yesmuteRemoteSessionAudio')){ //Mute Remote Audio

        // if(localStorage.getItem("muteAll") == "no"){
        //   localStorage.removeItem("muteAll");
        // }
        
        const stream_id = parseInt(message.split("@")[1]);

        let muteAudios = (localStorage.getItem("muteRemoteSessionAudio") != null) ? JSON.parse(localStorage.getItem("muteRemoteSessionAudio")) : []

        if(localStorage.getItem("unMuteRemoteSessionAudio")!=null){
          //Remove the unmuted stream from mute array
          let unmuteAudios = JSON.parse(localStorage.getItem("unMuteRemoteSessionAudio"));
          if (unmuteAudios.indexOf(stream_id) > -1) {
            unmuteAudios.splice(unmuteAudios.indexOf(stream_id), 1);
            localStorage.setItem("unMuteRemoteSessionAudio", JSON.stringify(unmuteAudios));
          } 
        }

        (muteAudios.indexOf(stream_id) == -1) ? muteAudios.push(stream_id) : null;
        localStorage.setItem("muteRemoteSessionAudio", JSON.stringify(muteAudios));
        this.pauseRemoteSessionAudioStream();
      }
    //}
      
    if(message.includes('unMuteRemoteSessionAudio')){ // //UnMute Remote Audio

      const stream_id = parseInt(message.split("@")[1]);
      let unMuteAudios = (localStorage.getItem("unMuteRemoteSessionAudio") != null) ? JSON.parse(localStorage.getItem("unMuteRemoteSessionAudio")) : []

      if(localStorage.getItem("muteRemoteSessionAudio")!=null){
        let muteAudios = JSON.parse(localStorage.getItem("muteRemoteSessionAudio"));
        if (muteAudios.indexOf(stream_id) > -1) {
          muteAudios.splice(muteAudios.indexOf(stream_id), 1);
          localStorage.setItem("muteRemoteSessionAudio", JSON.stringify(muteAudios));
        }
      }
      
      (unMuteAudios.indexOf(stream_id) == -1) ? unMuteAudios.push(stream_id) : null;
      localStorage.setItem("unMuteRemoteSessionAudio", JSON.stringify(unMuteAudios));
      this.resumeRemoteSessionAudioStream();
    }
  }

  pauseRemoteSessionVideoStream(){
    console.log("pauseremotesessionvideo")
    const remoteStreams = this.remoteSessionCalls;
    for(let i = 0; i<remoteStreams.length; i++){
      remoteStreams[i].remoteVideoMuted = false
      if(remoteStreams[i].stream!='' && JSON.parse(localStorage.getItem("muteRemoteSessionVideo")).indexOf(parseInt(remoteStreams[i].stream.getId().split('_session')[0])) > -1 ){
        console.log("pausesessionvideostream"+remoteStreams[i].stream.getId())
        remoteStreams[i].stream.muteVideo();
        remoteStreams[i].remoteVideoMuted = true
      }
    }
    this.remoteSessionCalls = remoteStreams;
    console.log(this.remoteSessionCalls)
  }
  
  resumeRemoteSessionVideoStream(){
    console.log("resumeremotesessionvideo")
    const remoteStreams = this.remoteSessionCalls;
    for(let i = 0; i<remoteStreams.length; i++){
      remoteStreams[i].remoteVideoMuted = true
      if(remoteStreams[i].stream!='' && JSON.parse(localStorage.getItem("unMuteRemoteSessionVideo")).indexOf(parseInt(remoteStreams[i].stream.getId().split('_session')[0])) > -1 ){
        console.log("resumesessionvideostream"+remoteStreams[i].stream.getId())
        remoteStreams[i].remoteVideoMuted = false
        remoteStreams[i].stream.unmuteVideo();
      }
    }
    this.remoteSessionCalls = remoteStreams
  }

  pauseRemoteSessionAudioStream(){
    console.log("pauseremotesessionaudio")
    const remoteStreams = this.remoteSessionCalls;
    for(let i = 0; i<remoteStreams.length; i++){
      remoteStreams[i].remoteAudioMuted = false
      console.log(remoteStreams[i].stream.getId()+"@@")
      if(remoteStreams[i].stream!='' && JSON.parse(localStorage.getItem("muteRemoteSessionAudio")).indexOf(parseInt(remoteStreams[i].stream.getId().split('_session')[0])) > -1 ){
        console.log("pausesessionaudiostream"+remoteStreams[i].stream.getId())
        remoteStreams[i].remoteAudioMuted = true
        remoteStreams[i].stream.muteAudio();
      }
    }
    this.remoteSessionCalls = remoteStreams
    console.log(this.remoteSessionCalls)
  }
  
  resumeRemoteSessionAudioStream(){
    console.log("resumesessionremoteaudio")
    const remoteStreams = this.remoteSessionCalls;
    for(let i = 0; i<remoteStreams.length; i++){
      remoteStreams[i].remoteAudioMuted = true
      if(remoteStreams[i].stream!='' && JSON.parse(localStorage.getItem("unMuteRemoteSessionAudio")).indexOf(parseInt(remoteStreams[i].stream.getId().split('_session')[0])) > -1 ){
        console.log("resumesessionaudiostream"+remoteStreams[i].stream.getId())
        remoteStreams[i].remoteAudioMuted = false
        remoteStreams[i].stream.unmuteAudio();
      }
    }
    this.remoteSessionCalls = remoteStreams
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
