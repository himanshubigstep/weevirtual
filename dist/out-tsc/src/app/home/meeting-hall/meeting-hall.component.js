import { __decorate, __param } from "tslib";
import { Component, ViewChild, Inject } from "@angular/core";
import { ClientEvent, StreamEvent, } from "ngx-agora";
import { DOCUMENT } from '@angular/common';
import { Chatbox } from "src/app/shared/models/chatInbox";
import { ScrollToBottomDirective } from "./scroll-to-bottom.directive";
import * as AgoraRTM from "agora-rtm-sdk";
import EventEmitter from "event-emitter";
import { MeetingHallDailogComponent } from "src/app/home/meeting-hall/dailog/meeting-hall-dailog/meeting-hall-dailog.component";
let MeetingHallComponent = /** @class */ (() => {
    let MeetingHallComponent = class MeetingHallComponent {
        constructor(agoraService, chatServeice, eventService, router, title, meta, dialog, document) {
            this.agoraService = agoraService;
            this.chatServeice = chatServeice;
            this.eventService = eventService;
            this.router = router;
            this.title = title;
            this.meta = meta;
            this.dialog = dialog;
            this.document = document;
            this.panellistUsersList = [];
            this.totalUsersList = [];
            /**
             * App ID used when connecting to the Agora.io servers
             */
            this.appId = "bc77dbe489d5466bb0084e0ff147ab9f";
            /**
             * Channel (meeting room) within the Agora app to join
             */
            this.channel = "12345";
            /**
             * All the IDs of other users that have joined the call
             */
            this.remoteCalls = [];
            // remoteScreenShare: string = "";
            this.screenShare = false;
            /**
             * Whether the local client has tuned in to the Agora meeting room
             */
            this.connected = false;
            /**
             * Whether the local client's A/V stream has been published to the remote meeting room
             */
            this.published = false;
            this.userRole = "audience"; // to set user role as host or audience
            this.audioMuted = false;
            this.videoMuted = false;
            this.screenon = false;
            this.screenShareDiv = "agora_screen";
            this.userDetails = this.eventService.getEventDetails();
            this.question = new Chatbox();
            this.uid = this.userDetails.user_details.id; //Math.floor(Math.random() * 100);
            this.client = this.agoraService.createClient({
                mode: "rtc",
                codec: "h264",
            });
            this.assignClientHandlers();
            this.screenClient = this.agoraService.createClient({
                mode: "rtc",
                codec: "vp8",
            });
            this.assignScreenClientHandlers();
            this.join();
            let uType = localStorage.getItem('currentUser');
            this.userType = JSON.parse(uType);
            //console.log(this.userType.type);
            // RTM 
            this.isReady = false;
            this.rtmClient = AgoraRTM.createInstance(this.appId);
            this.rtmChannel = this.rtmClient.createChannel(this.channel);
            this.channelEmitter = new EventEmitter();
            console.log(this.rtmClient);
            console.log('rtm client working');
            this.assignRtmHandlers();
            this.assignRtmChannelEmitterHandlers();
            // RTM LOGIN
            this.rtmLogin();
        }
        ngOnInit() {
            this.elem = document.documentElement;
            this.getPanellistUsers(this.userDetails.event_details.id);
            this.client.init(this.appId, () => console.log("Initialized successfully"), () => console.log("Could not initialize"));
            this.screenClient.init(this.appId, () => console.log("screen Initialized successfully"), () => console.log("screen Could not initialize"));
            this.loadCarouselScript();
            if (this.userDetails.user_details.user_type != "audience" &&
                this.userDetails.user_details.user_type != "attendee") {
                this.screenShareDivID = "agora_remote-screen-" + this.uid;
                this.remoteCalls.push({
                    divId: "agora_remote-" + this.uid,
                    userName: this.userDetails.user_details.name,
                    designation: this.userDetails.user_details.designation,
                });
                this.userRole = "host";
            }
            this.getMeetingChat(this.userDetails.event_details.id);
            // SEO Meta Tags
            this.title.setTitle('Meeting Hall | Leaders Of Tomorrow - Season 8 | Largest Entrepreneurship Platform | ET NOW');
            this.meta.addTags([
                { name: 'description', content: 'Session On Technology and Innovation for Sustainability. Leaders of Tomorrow - Season 8, the most comprehensive enabling platform for small businesses.' },
            ]);
        }
        openDialog() {
            const dialogRef = this.dialog.open(MeetingHallDailogComponent, {
                width: '600px',
            });
            dialogRef.afterClosed().subscribe(result => {
                console.log('The dialog was closed');
                //this.animal = result;
            });
        }
        assignRtmHandlers() {
            // CHECK STATE OF CONNECTION
            this.rtmClient.on('ConnectionStateChanged', (newState, reason) => {
                console.log('on connection state changed to ' + newState + ' reason: ' + reason);
                if (newState == 'DISCONNECTED') {
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
                console.log('[RTM-DEMO] MemberLeft', memberId);
            });
            // CHANNEL MESSAGE
            this.rtmChannel.on('ChannelMessage', ({ text: message }, senderId) => {
                console.log('ChannelMessage :', message, senderId);
                this.channelEmitter.emit(`${message}-TO-JOIN`, message);
            });
        }
        assignRtmChannelEmitterHandlers() {
            this.channelEmitter.on('joinedChannel', () => {
                this.isReady = true;
                console.log("Channel emitter work fine");
                this.sendChannelMessage('helloworld');
            });
            this.channelEmitter.on(`ALLOW_MODERATOR-TO-JOIN`, function ({ content }) {
                // ALLOW MODERATOR TO JOIN CALL
            });
            this.channelEmitter.on(`ALLOW_PANELLIST-TO-JOIN`, function ({ content }) {
                // ALLOW PANELLIST TO JOIN CALL
            });
            this.channelEmitter.on(`ALLOW_ATTENDEE-TO-JOIN`, function ({ content }) {
                // ALLOW ATTENDEE TO JOIN CALL
            });
        }
        rtmLogin() {
            this.rtmClient.login({ token: null, uid: this.uid.toString() }).then(() => {
                console.log('AgoraRTM client login success');
                this.sendPeerMessage();
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
        rtmLogout() {
            this.leaveChannel();
            this.rtmClient.logout().then(() => {
                console.log('AgoraRTM client logout');
            }).catch(err => {
                console.log('AgoraRTM client logout failure', err);
            });
        }
        leaveChannel() {
            // LEAVE CHANNEL
            this.rtmChannel.leave().then(() => {
                console.log('Channel leave');
            }).catch(err => {
                console.log('Channel leave failure', err);
            });
        }
        sendChannelMessage(message) {
            if (!this.isReady) {
                console.log("user not logged in channel");
                return;
            }
            this.rtmChannel.sendMessage({ text: `${message}` }).then(() => {
                console.log("channel message-send success");
            }).catch(error => {
                console.log("channel message-send failure");
            });
        }
        sendPeerMessage() {
            // PEER TO PEER MESSAGE
            this.rtmClient.sendMessageToPeer({ text: 'test peer message' }, // An RtmMessage object.
            this.uid.toString()).then(sendResult => {
                if (sendResult.hasPeerReceived) {
                    console.log('yes peer received');
                    /* Your code for handling the event that the remote user receives the message. */
                }
                else {
                    console.log('not peer received');
                    /* Your code for handling the event that the message is received by the server but the remote user cannot be reached. */
                }
            }).catch(error => {
                console.log('peer error');
                /* Your code for handling the event of a message send failure. */
            });
        }
        assignClientHandlers() {
            this.client.on(ClientEvent.LocalStreamPublished, (evt) => {
                this.published = true;
                console.log("Publish local stream successfully");
            });
            this.client.on(ClientEvent.Error, (error) => {
                console.log("Got error msg:", error.reason);
                if (error.reason === "DYNAMIC_KEY_TIMEOUT") {
                    this.client.renewChannelKey("", () => console.log("Renewed the channel key successfully."), (renewError) => console.error("Renew channel key failed: ", renewError));
                }
            });
            this.client.on(ClientEvent.RemoteStreamAdded, (evt) => {
                const stream = evt.stream;
                this.client.subscribe(stream, { audio: true, video: true }, (err) => {
                    console.log("Subscribe stream failed", err);
                });
            });
            this.client.on(ClientEvent.RemoteStreamSubscribed, (evt) => {
                const stream = evt.stream;
                const id = this.getRemoteId(stream);
                this.totalUsersList.push(id);
                // const selectedObj = true;
                console.log(this.panellistUsersList.filter((res) => res.id == stream.getId()));
                const selectedObj = this.panellistUsersList.filter((res) => res.id == stream.getId())[0];
                if (selectedObj) {
                    // this.remoteCalls.push({ divId: id, userName: "full name ", designation: 'developer' });
                    this.remoteCalls.push({
                        divId: id,
                        userName: selectedObj.full_name,
                        designation: selectedObj.designation,
                    });
                    setTimeout(() => stream.play(id), 1000);
                }
            });
            this.client.on(ClientEvent.RemoteStreamRemoved, (evt) => {
                const stream = evt.stream;
                if (stream) {
                    stream.stop();
                    this.remoteCalls = [];
                    console.log(`Remote stream is removed ${stream.getId()}`);
                }
            });
            this.client.on(ClientEvent.PeerLeave, (evt) => {
                const stream = evt.stream;
                if (stream) {
                    stream.stop();
                    this.remoteCalls = this.remoteCalls.filter((call) => call.divId !== `${this.getRemoteId(stream)}`);
                    this.totalUsersList = this.totalUsersList.filter((call) => call !== `${this.getRemoteId(stream)}`);
                    console.log(`${evt.uid} left from this channel`);
                }
            });
        }
        assignScreenClientHandlers() {
            this.screenClient.on(ClientEvent.LocalStreamPublished, (evt) => {
                this.published = true;
                console.log("Publish local screen stream successfully");
            });
            this.screenClient.on(ClientEvent.Error, (error) => {
                console.log("Got error msg:", error.reason);
                if (error.reason === "DYNAMIC_KEY_TIMEOUT") {
                    this.screenClient.renewChannelKey("", () => console.log("Renewed the channel key successfully."), (renewError) => console.error("Renew channel key failed: ", renewError));
                }
            });
            this.screenClient.on(ClientEvent.PeerLeave, (evt) => {
                const stream = evt.stream;
                if (stream) {
                    stream.stop();
                    console.log(`${evt.uid} left from this channel`);
                }
            });
            //this.screenStream.on("stopScreenSharing", () => {
            //  shareEnd();
            //  console.log("Stop Screen Sharing at" + new Date());
            //});
        }
        join() {
            if (!this.connected) {
                this.localStream = this.agoraService.createStream({
                    streamID: this.uid,
                    audio: true,
                    video: true,
                    screen: false,
                });
                this.assignLocalStreamHandlers();
                this.init();
                this.client.join(null, this.channel, this.uid);
                setTimeout(() => {
                    this.publish();
                    this.client.setClientRole(this.userRole, () => {
                        console.log("client role changed");
                    });
                    this.totalUsersList.push("agora_remote-" + this.uid);
                }, 3000);
            }
            else {
                alert("Aready joined the event ");
            }
            // Sets the audio profile with a 48-kHz sampling rate, stereo sound, and 192-Kbps bitrate.
            // this.localStream.setAudioProfile("high_quality_stereo");
            // this.client.enableAudioVolumeIndicator();
        }
        init() {
            this.localStream.init(() => {
                // The user has granted access to the camera and mic.
                console.log("getUserMedia successfully");
                if (this.userDetails.user_details.user_type != "audience" &&
                    this.userDetails.user_details.user_type != "attendee") {
                    this.localStream.play("agora_remote-" + this.uid);
                }
                this.connected = true;
            }, (err) => console.log("getUserMedia failed", err));
        }
        assignLocalStreamHandlers() {
            // The user has granted access to the camera and mic.
            this.localStream.on(StreamEvent.MediaAccessAllowed, () => {
                console.log("accessAllowed");
            });
            // The user has denied access to the camera and mic.
            this.localStream.on(StreamEvent.MediaAccessDenied, () => {
                console.log("accessDenied");
            });
        }
        publish() {
            this.client.publish(this.localStream, (err) => console.log("Publish local stream error: " + err));
        }
        leave() {
            if (this.connected) {
                this.client.leave(() => {
                    console.log("Left the channel successfully");
                    this.localStream.stop();
                    this.localStream.close();
                    this.connected = false;
                    this.published = false;
                    this.remoteCalls = [];
                    this.screenShareDivID = "";
                    this.router.navigate(["/home/lounge/"]);
                }, (err) => {
                    console.log("Leave channel failed");
                });
                this.rtmLogout();
            }
            else {
                this.agoraService.AgoraRTC.Logger.warning("Local client is not connected to channel.");
            }
        }
        unpublish() {
            this.client.unpublish(this.localStream, (error) => console.error(error));
            this.published = false;
        }
        shareScreen() {
            var userID = null; // set to null to auto generate uid on successfull connection
            //Number.tem = windows.navigator.userAgent.match(/(Chrome(?=\/))\/?(\d+)/i);
            //if(parseInt(tem[2]) >= 72  && navigator.mediaDevices.getDisplayMedia ) {
            // Create the stream for screensharing
            this.screenStream = this.agoraService.createStream({
                streamID: this.uid + "-screen",
                audio: false,
                video: false,
                screen: true,
            });
            //}
            this.assignLocalScreenStreamHandlers();
            this.initScreenShare();
            this.screenClient.join(null, this.channel, userID);
            setTimeout(() => {
                this.screenPublish();
                this.totalUsersList.push("agora_remote-screen" + this.uid);
            }, 3000);
        }
        assignLocalScreenStreamHandlers() {
            // The user has granted access to the camera and mic.
            this.screenStream.on(StreamEvent.MediaAccessAllowed, () => {
                console.log("accessAllowed");
            });
            // The user has denied access to the camera and mic.
            this.screenStream.on(StreamEvent.MediaAccessDenied, () => {
                console.log("accessDenied");
            });
        }
        initScreenShare() {
            this.screenStream.init(() => {
                // The user has granted access to the camera and mic.
                // console.log("getUserMedia successfully");
                this.screenShare = true;
                this.screenStream.play("agora_remote-" + this.uid);
            }, (err) => console.log("getUserMedia failed", err));
        }
        screenPublish() {
            this.screenClient.publish(this.screenStream, (err) => console.log("Publish local screen stream error: " + err));
        }
        getPanellistUsers(eventId) {
            this.eventService
                .getPanellistByEventId({ event_id: eventId })
                .then((response) => {
                console.log(response);
                if (response.panellists.length > 0) {
                    this.panellistUsersList = response.panellists;
                }
                else {
                    this.panellistUsersList = [];
                }
            })
                .catch((error) => {
                console.log(error);
            });
        }
        getRemoteId(stream) {
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
        removeScreenShares() {
            this.screenUnPublish();
            this.screenStream.stop();
            this.join();
            // this.publish();
        }
        navigatetologin() {
            localStorage.clear();
            localStorage.setItem("reload", "true");
            this.router.navigate(["/home"]);
        }
        goToMobileChat() {
            this.router.navigate(['home/mobile-chat']);
        }
        screenUnPublish() {
            this.client.unpublish(this.screenStream, (error) => console.error(error));
        }
        allowUserByType() {
            // console.log(this.selectuserType);
            // let message = "ALLOW_MODERATOR" ;
            this.sendChannelMessage(this.selectuserType);
        }
        openFullscreen() {
            if (this.elem.requestFullscreen) {
                this.elem.requestFullscreen();
            }
            else if (this.elem.mozRequestFullScreen) {
                /* Firefox */
                this.elem.mozRequestFullScreen();
            }
            else if (this.elem.webkitRequestFullscreen) {
                /* Chrome, Safari and Opera */
                this.elem.webkitRequestFullscreen();
            }
            else if (this.elem.msRequestFullscreen) {
                /* IE/Edge */
                this.elem.msRequestFullscreen();
                this.localStream.openFullscreen();
                this.screenon = true;
            }
        }
        /* Close fullscreen */
        closeFullscreen() {
            if (this.document.exitFullscreen) {
                this.document.exitFullscreen();
            }
            else if (this.document.mozCancelFullScreen) {
                /* Firefox */
                this.document.mozCancelFullScreen();
            }
            else if (this.document.webkitExitFullscreen) {
                /* Chrome, Safari and Opera */
                this.document.webkitExitFullscreen();
            }
            else if (this.document.msExitFullscreen) {
                /* IE/Edge */
                this.document.msExitFullscreen();
                this.localStream.closeFullscreen();
                this.screenon = false;
            }
        }
    };
    __decorate([
        ViewChild(ScrollToBottomDirective)
    ], MeetingHallComponent.prototype, "scroll", void 0);
    MeetingHallComponent = __decorate([
        Component({
            selector: "app-meeting-hall",
            templateUrl: "./meeting-hall.component.html",
            styleUrls: ["./meeting-hall.component.scss"],
        }),
        __param(7, Inject(DOCUMENT))
    ], MeetingHallComponent);
    return MeetingHallComponent;
})();
export { MeetingHallComponent };
//# sourceMappingURL=meeting-hall.component.js.map