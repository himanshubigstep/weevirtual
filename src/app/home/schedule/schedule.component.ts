import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from 'src/app/shared/services/event.service';

import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  eventAllDetails;
  event_details;
  sponsors_details;
  speakers = {
    panellists: {},
    teams:{},
    description: null,
    title: null
  };
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
  dates = [];
  fullName;
WebinarS;
  constructor(private router: Router, private eventService: EventService) { }

  ngOnInit(): void {

    this.eventAllDetails = this.eventService.getEventDetails();
    this.eventService.eventDetails_Update.subscribe(response => {
      let res = response;
      this.eventAllDetails = this.eventService.getEventDetails();
      this.user_details = this.eventAllDetails.user_details;
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
  }
  onClickSpeakers(webinar) {
    console.log(webinar);
    this.WebinarS = webinar;
    this.speakers = {
      panellists: webinar.panellists,
      teams:webinar.teams,
      description: webinar.description,
      title: webinar.title
    }
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
  // 
  navigatetolobby() {
    this.router.navigate(['/home/lounge']);
  }

   //Download
   downloadPdf() {
    let doc = [];
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    let docDefinition = {}


    pdfMake.createPdf(docDefinition).download('Organiser-details');
  }

}
