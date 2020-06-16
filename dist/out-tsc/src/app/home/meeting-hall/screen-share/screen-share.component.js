import { __decorate } from "tslib";
import { Component } from "@angular/core";
import { ClientEvent, StreamEvent, } from "ngx-agora";
let ScreenShareComponent = /** @class */ (() => {
    let ScreenShareComponent = class ScreenShareComponent {
        constructor(agoraService, eventService) {
            this.agoraService = agoraService;
            this.eventService = eventService;
            this.panellistUsersList = [];
            this.totalUsersList = [];
            this.screenShare = false;
            this.appId = "bc77dbe489d5466bb0084e0ff147ab9f";
            this.channel = "123";
            this.remoteCalls = [];
            this.connected = false;
            this.screenShareDiv = "agora_screen";
            this.published = false;
            this.userRole = "audience"; // to set user role as host or audience
            this.audioMuted = false;
            this.videoMuted = false;
            this.userDetails = this.eventService.getEventDetails();
            this.uid = this.userDetails.user_details.id; //Math.floor(Math.random() * 100);
            this.screenClient = this.agoraService.createClient({
                mode: "rtc",
                codec: "h264",
            });
            this.assignClientHandlers();
        }
        ngOnInit() {
            // this.getPanellistUsers(this.userDetails.event_details.id);
            this.screenClient.init(this.appId, () => console.log("Initialized successfully"), () => console.log("Could not initialize"));
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
        shareScreen() {
            if (this.screenShare == false) {
                this.screenStream = this.agoraService.createStream({
                    streamID: this.uid,
                    audio: false,
                    video: false,
                    screen: true,
                });
                this.assignLocalStreamHandlers();
                this.init();
                this.screenClient.join(null, this.channel, this.uid);
                setTimeout(() => {
                    this.publish();
                    this.screenClient.setClientRole(this.userRole, () => {
                        console.log("client role changed");
                    });
                    this.totalUsersList.push("agora_screen-remote-" + this.uid);
                }, 3000);
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
            this.screenClient.publish(this.screenStream, (err) => console.log("Publish local stream error: " + err));
        }
        init() {
            this.screenStream.init(() => {
                // The user has granted access to the camera and mic.
                // console.log("getUserMedia successfully");
                this.screenShare = true;
                this.screenStream.play(this.screenShareDiv);
            }, (err) => console.log("getUserMedia failed", err));
        }
        assignLocalStreamHandlers() {
            // The user has granted access to the camera and mic.
            this.screenStream.on(StreamEvent.MediaAccessAllowed, () => {
                console.log("accessAllowed");
            });
            // The user has denied access to the camera and mic.
            this.screenStream.on(StreamEvent.MediaAccessDenied, () => {
                console.log("accessDenied");
            });
        }
        assignClientHandlers() {
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
        getRemoteId(stream) {
            // console.log(stream.getId());
            return `agora_remote-${stream.getId()}`;
        }
    };
    ScreenShareComponent = __decorate([
        Component({
            selector: "app-screen-share",
            templateUrl: "./screen-share.component.html",
            styleUrls: ["./screen-share.component.scss"],
        })
    ], ScreenShareComponent);
    return ScreenShareComponent;
})();
export { ScreenShareComponent };
//# sourceMappingURL=screen-share.component.js.map