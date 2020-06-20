import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, Observer } from 'rxjs';
import { Router } from '@angular/router';
import { HttpService } from './http.service';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class EventService {

  private event_details_sub = new BehaviorSubject<any>(null);//-----------Subject variables
  private videoStatus = new BehaviorSubject<any>(null);
  public messages: Subject<string>;
  event_details = [];
  interval;
  timerObj = {};

  private readonly getPanellistByEventIdApi = 'events/panellist-list/';

  constructor(private router: Router, private httpService: HttpService,private httpClient:HttpClient) { }

  get eventDetails_Update(): Observable<boolean> {
    if (localStorage.getItem('details')) {
      this.event_details = JSON.parse(localStorage.getItem('details'));
      this.event_details_sub.next(this.event_details);
    }
    return this.event_details_sub.asObservable();
  }

  getEventDetails(): Observable<any> {

    return JSON.parse(localStorage.getItem('details'));;
  }
  eventDetailsUpdate(): void{
    if (localStorage.getItem('details')) {
      this.event_details = JSON.parse(localStorage.getItem('details'));
      this.event_details_sub.next(this.event_details);
    }
    this.event_details_sub.next(this.event_details);
  }
  timer() {
    let Days;
    let start = "2020-06-01";
    let end = "2020-05-06";
    let present_Date = new Date;
    let present_time;
    let date = new Date;
    let lastDayofthemonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    let present_month = present_Date.getMonth();
    let present_day = present_Date.getDate();
    let monthStart = start.slice(5, 7);
    let dayStart = start.slice(8, 10)

    if (Number(monthStart) == present_month + 1) {
      Days = Number(dayStart) - present_day;
    } else {
      let daysofpresentmonth = lastDayofthemonth.getDate() - present_day;

      Days = Number(daysofpresentmonth) + Number(dayStart);
    }
    
    this.timerObj = { days: Days - 1, hours:24 - present_Date.getHours(), mins: 60 - present_Date.getMinutes(), secs:60 - present_Date.getSeconds() };
    return this.timerObj;
  }
getVedioStreaminStatus(usertype,eventId){
  let body ={
    user_type:usertype,
    event_id : eventId
  }
  return this.httpService.post('events/video-stream-status/',body);
}
  getPanellistByEventId(obj) {
    return this.httpService.post(this.getPanellistByEventIdApi, obj).toPromise();
  }
//   setsock() {
  
//     let socket = new WebSocket('ws://15.206.20.212:8000/ws/4/');
//     console.log('WebSockets connection created.');
// socket.onopen= function(e){
//   console.log("websocket open",e);
//   socket.send(JSON.stringify({'event':'4'}));
// };
// socket.onmessage = function(data) {
//       console.log("data from socket:" + data);

//     };


//   }
   connect(): Subject<MessageEvent> {
    let ws = new WebSocket('wss://dev-api.weevirtuall.com/ws/4/');
    ws.onopen= function(e){
        console.log("websocket open",e);
        ws.send(JSON.stringify({'event':'3'}));
      };
    let observable = Observable.create(
      (obs: Observer<MessageEvent>) => {
        ws.onmessage = obs.next.bind(obs);
        ws.onerror = obs.error.bind(obs);
        ws.onclose = obs.complete.bind(obs);
        return ws.close.bind(ws);
      })
    let observer = {
      next: (data: string) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
          if(data=="stop")
            ws.close(1000,"bye")
        }
      }
    }
    return Subject.create(observer, observable);
  }
 
 videoStatusUpdateFromAdmin(userType,event_id){
   let body ={
     user_type:userType,
     event_id:event_id
   }
   let token = localStorage.getItem('token');
if(userType == 'panellist'){
return this.httpClient.post('https://dev-api.weevirtuall.com/events/panellist-video-status/',body,{headers:{'Authorization' :token}});
}
if(userType == 'attendee'){
  return this.httpClient.post('https://dev-api.weevirtuall.com/events/attendee-video-status/',body,{headers:{'Authorization' :token}});
  }
 }
}
