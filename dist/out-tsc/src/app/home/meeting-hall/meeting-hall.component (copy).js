import { __decorate } from "tslib";
import { Component, ViewChild } from "@angular/core";
import { ClientEvent, StreamEvent, } from "ngx-agora";
import { Chatbox } from "src/app/shared/models/chatInbox";
import { ScrollToBottomDirective } from "./scroll-to-bottom.directive";
let MeetingHallComponent = /** @class */ (() => {
    let MeetingHallComponent = class MeetingHallComponent {
        constructor(agoraService, chatServeice, eventService, router, title, meta) {
            this.agoraService = agoraService;
            this.chatServeice = chatServeice;
            this.eventService = eventService;
            this.router = router;
            this.title = title;
            this.meta = meta;
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
        }
        ngOnInit() {
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
                    designation: this.userDetails.user_details.designation
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
        shareScreen() {
            // Number.tem = ua.match(/(Chrome(?=\/))\/?(\d+)/i);
            // if (parseInt(tem[2]) >= 72 && navigator.mediaDevices.getDisplayMedia) {
            // Create the stream for screensharing
            if (this.screenShare == false) {
                // this.localStream.stop();
                // this.unpublish();
                // this.screenShare = true;
                // this.screenStream = this.agoraService.createStream({
                //   streamID: this.uid + "-screen",
                //   audio: false,
                //   video: false,
                //   screen: true,
                // });
                // // }
                // this.screenStream.on(StreamEvent.MediaAccessAllowed, () => {
                //   console.log("accessAllowed");
                // });
                // this.screenStream.on(StreamEvent.MediaAccessDenied, () => {
                //   console.log("accessDenied");
                // });
                // this.screenStream.init(
                //   () => {
                //     console.log("getUserMedia successfully");
                //     this.screenStream.play("agora_remote-screen-" + this.uid);
                //     this.connected = true;
                //     this.screenShare = true;
                //   },
                //   (err) => console.log("getUserMedia failed", err)
                // );
                // this.client.join(null, this.channel, this.uid+11);
                // setTimeout(() => {
                //   this.client.publish(this.screenStream, (err) =>
                //     console.log("Publish share screen stream error: " + err)
                //   );
                //   this.client.setClientRole(this.userRole, () => {
                //     console.log("client role changed");
                //   });
                // }, 3000);
            }
            else {
                // this.screenStream.stop();
                // this.client.unpublish(this.screenStream, (error) => console.error(error));
                // //   this.client.join(null, this.channel, this.uid);
                // // setTimeout(() => {
                // //   this.publish();
                // //   this.client.setClientRole(this.userRole, () => {
                // //     console.log("client role changed");
                // //   });
                // //   this.totalUsersList = [{}];
                // // }, 3000);
                // //   this.localStream.play("agora_remote-" + this.uid);
                // this.join();
                // this.screenShare = false;
            }
        }
        publish() {
            this.client.publish(this.localStream, (err) => console.log("Publish local stream error: " + err));
        }
        unpublish() {
            this.client.unpublish(this.localStream, (error) => console.error(error));
            this.published = false;
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
            }
            else {
                this.agoraService.AgoraRTC.Logger.warning("Local client is not connected to channel.");
            }
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
        assignClientHandlers() {
            console.log("called");
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
        getRemoteId(stream) {
            console.log(stream.getId());
            return `agora_remote-${stream.getId()}`;
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
        //  scrollToBottom() {
        //   document.getElementById("scroll").scrollIntoView(false); // Bottom
        // }
        screenPublish() {
            this.client.publish(this.screenStream, (err) => console.log("Publish local stream error: " + err));
        }
        screenUnPublish() {
            this.client.unpublish(this.screenStream, (error) => console.error(error));
        }
        screenShares() {
            this.screenStream = this.agoraService.createStream({
                streamID: this.uid + "-screen",
                audio: true,
                video: true,
                screen: true,
            });
            this.screenStream.init(() => {
                // The user has granted access to the camera and mic.
                console.log("getUserMedia successfully");
                this.screenStream.play("share-screen");
                this.unpublish();
                this.localStream.stop();
            }, (err) => console.log("getUserMedia failed", err));
            setTimeout(() => {
                this.screenPublish();
            }, 2000);
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
        shareScreens() {
            this.screenStream = this.agoraService.createStream({
                streamID: this.uid,
                audio: false,
                video: false,
                screen: true,
                mediaSource: "screen",
            });
            this.assignLocalScreenStreamHandlers();
            this.initScreenShare();
            this.screenClient.join(null, this.channel + "45", this.uid + 0);
            setTimeout(() => {
                this.screenPublish();
            }, 5000);
        }
        // screenPublish(): void {
        //   this.screenClient.publish(this.screenStream, (err) =>
        //     console.log("Publish local stream error: " + err)
        //   );
        // }
        initScreenShare() {
            this.screenStream.init(() => {
                // The user has granted access to the camera and mic.
                // console.log("getUserMedia successfully");
                this.screenShare = true;
                this.screenStream.play(this.screenShareDiv);
            }, (err) => console.log("getUserMedia failed", err));
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
        assignScreenClientHandlers() {
            // console.log("called");
            this.screenClient.on(ClientEvent.LocalStreamPublished, (evt) => {
                this.published = true;
                console.log("Publish local stream successfully");
            });
            this.screenClient.on(ClientEvent.Error, (error) => {
                console.log("Got error msg:", error.reason);
                if (error.reason === "DYNAMIC_KEY_TIMEOUT") {
                    this.screenClient.renewChannelKey("", () => console.log("Renewed the channel key successfully."), (renewError) => console.error("Renew channel key failed: ", renewError));
                }
            });
            this.screenClient.on(ClientEvent.RemoteStreamAdded, (evt) => {
                const stream = evt.stream;
                this.screenClient.subscribe(stream, { audio: true, video: true }, (err) => {
                    console.log("Subscribe stream failed", err);
                });
            });
            this.screenClient.on(ClientEvent.RemoteStreamSubscribed, (evt) => {
                const stream = evt.stream;
                const id = this.getRemoteId(stream);
                console.log(id);
                this.screenShareDiv = id;
                setTimeout(() => stream.play(id), 1000);
            });
            this.screenClient.on(ClientEvent.RemoteStreamRemoved, (evt) => {
                const stream = evt.stream;
                if (stream) {
                    stream.stop();
                    this.remoteCalls = [];
                    console.log(`Remote stream is removed ${stream.getId()}`);
                }
            });
            this.screenClient.on(ClientEvent.PeerLeave, (evt) => {
                const stream = evt.stream;
                if (stream) {
                    stream.stop();
                    console.log(`${evt.uid} left from this channel`);
                }
            });
        }
        goToMobileChat() {
            this.router.navigate(['home/mobile-chat']);
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
        })
    ], MeetingHallComponent);
    return MeetingHallComponent;
})();
export { MeetingHallComponent };
//# sourceMappingURL=meeting-hall.component (copy).js.map