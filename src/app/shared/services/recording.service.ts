import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { HttpService } from './http.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class RecordingService {
  currentUser;
  deviceId;
  loggedIn = new BehaviorSubject<boolean>(false);
  userData = new BehaviorSubject<any>(null);
  userId = new BehaviorSubject<any>(null);

  constructor(private router: Router, private http: HttpClient) { }
  // ----------------------------------------------------------------------------------------------------------------------
  // @Subject function loggedin and loggeduserdata
  // ----------------------------------------------------------------------------------------------------------------------
  get isLoggedIn(): Observable<boolean> {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser) {
      this.loggedIn.next(true);
    }
    return this.loggedIn.asObservable();
  }
  get loggedUserData(): Observable<boolean> {
    let currentuser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentuser) {
      this.userData.next({
        email: currentuser.email,
        event: currentuser.event,
        id: currentuser.id,
        mobile_number: currentuser.mobile_number,
        name: currentuser.name,
        organization: currentuser.organization,
        designation:currentuser.designation
      });
    }
    return this.userData.asObservable();
  }

  get userIdDetail(): Observable<any>{
    return this.userId.asObservable();
  }
  getHeader() {
    var usernamePassword = `${environment.customerId}:${environment.customerCertificate}`;
    // Encode the String
    var encodedString = window.btoa(usernamePassword);
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Basic ${encodedString}`);
    return headers;
  }
  start(channelName, userId, appId, resourceId, isHd, isHdPlus): Observable<any>{
    let transcodingConfig = {
      width:640,
      height:480,
      fps:10,
      bitrate:400,
      mixedVideoLayout:1
    }
    if( isHdPlus ) {
      transcodingConfig = {
        width:2560,
        height:1440,
        fps:30,
        bitrate:4850,
        mixedVideoLayout:1
      }
    } else if ( isHd ) {
      transcodingConfig = {
        width:1920,
        height:1080,
        fps:30,
        bitrate:3150,
        mixedVideoLayout:1
      }
    }

    let body = {
      cname:channelName,
      uid: String(userId),
      clientRequest:{
        recordingConfig:{
          maxIdleTime:120,
          streamTypes:2,
          audioProfile:1,
          channelType:0,
          videoStreamType:0,
          transcodingConfig:transcodingConfig
        },
        storageConfig: environment.storageConfig
      }
    }
    const headers = this.getHeader();
    return this.http.post(
      `https://api.agora.io/v1/apps/${appId}/cloud_recording/resourceid/${resourceId}/mode/mix/start`,
      body,
      {headers: headers}
    );
  }
  acquire(channelName, userId, appId): Observable<any> {
 
    let body = {
      cname: channelName,
      uid: String(userId),
      clientRequest: {}
    }
    const headers = this.getHeader();
    return this.http.post(`https://api.agora.io/v1/apps/${appId}/cloud_recording/acquire`, body, {headers: headers});
  }

  stop(channelName, userId, appId, resourceId, recordingSid): Observable<any>{
    let body = {
      cname: channelName,
      uid: String(userId),
      clientRequest: {}
    }
     
    var string = "f56fdacd5bad402d91e24a4c9506a325"+":"+"2d7cb85998734c229709d708c28ea651";
    // Encode the String
    var encodedString = window.btoa(string);
   
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Basic ${encodedString}`);
    
    return this.http.post(`https://api.agora.io/v1/apps/${appId}/cloud_recording/resourceid/${resourceId}/sid/${recordingSid}/mode/mix/stop`, body, {headers: headers});
  }
}

