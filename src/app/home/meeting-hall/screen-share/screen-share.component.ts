import { Component, OnInit } from "@angular/core";
import {
  NgxAgoraService,
  Stream,
  AgoraClient,
  ClientEvent,
  StreamEvent,
} from "ngx-agora";
import { EventService } from "src/app/shared/services/event.service";

@Component({
  selector: "app-screen-share",
  templateUrl: "./screen-share.component.html",
  styleUrls: ["./screen-share.component.scss"],
})
export class ScreenShareComponent implements OnInit {
  private screenStream: Stream;
  private screenClient: AgoraClient;
  public userDetails: any;

  panellistUsersList = [];
  totalUsersList = [];

  screenShare: boolean = false;
  appId = "bc77dbe489d5466bb0084e0ff147ab9f";
  channel = "123";
  uid: number;
  remoteCalls: any[] = [];
  connected = false;
  screenShareDiv: string = "agora_screen";
  published = false;

  userRole: any = "audience"; // to set user role as host or audience

  audioMuted = false;
  videoMuted = false;

  constructor(
    private agoraService: NgxAgoraService,
    private eventService: EventService
  ) {
    this.userDetails = this.eventService.getEventDetails();
    this.uid = this.userDetails.user_details.id; //Math.floor(Math.random() * 100);

    this.screenClient = this.agoraService.createClient({
      mode: "rtc",
      codec: "h264",
    });
    this.assignClientHandlers();
  }

  ngOnInit(): void {
    // this.getPanellistUsers(this.userDetails.event_details.id);

    this.screenClient.init(
      this.appId,
      () => console.log("Initialized successfully"),
      () => console.log("Could not initialize")
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

  shareScreen(): void {
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
    } else {
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

  publish(): void {
    this.screenClient.publish(this.screenStream, (err) =>
      console.log("Publish local stream error: " + err)
    );
  }

  protected init(): void {
    this.screenStream.init(
      () => {
        // The user has granted access to the camera and mic.
        // console.log("getUserMedia successfully");
        this.screenShare = true;
        this.screenStream.play(this.screenShareDiv);
      },
      (err) => console.log("getUserMedia failed", err)
    );
  }

  private assignLocalStreamHandlers(): void {
    // The user has granted access to the camera and mic.
    this.screenStream.on(StreamEvent.MediaAccessAllowed, () => {
      console.log("accessAllowed");
    });
    // The user has denied access to the camera and mic.
    this.screenStream.on(StreamEvent.MediaAccessDenied, () => {
      console.log("accessDenied");
    });
  }

  private assignClientHandlers(): void {
    // console.log("called");
    this.screenClient.on(ClientEvent.LocalStreamPublished, (evt) => {
      this.published = true;
      console.log("Publish local stream successfully");
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

    this.screenClient.on(ClientEvent.RemoteStreamAdded, (evt) => {
      const stream = evt.stream as Stream;
      this.screenClient.subscribe(
        stream,
        { audio: true, video: true },
        (err) => {
          console.log("Subscribe stream failed", err);
        }
      );
    });

    this.screenClient.on(ClientEvent.RemoteStreamSubscribed, (evt) => {
      const stream = evt.stream as Stream;
      const id = this.getRemoteId(stream);
      console.log(id);
      this.screenShareDiv = id;
      setTimeout(() => stream.play(id), 1000);
    });

    this.screenClient.on(ClientEvent.RemoteStreamRemoved, (evt) => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = [];
        console.log(`Remote stream is removed ${stream.getId()}`);
      }
    });

    this.screenClient.on(ClientEvent.PeerLeave, (evt) => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        console.log(`${evt.uid} left from this channel`);
      }
    });
  }

  private getRemoteId(stream: Stream): string {
    // console.log(stream.getId());
    return `agora_remote-${stream.getId()}`;
  }
}
