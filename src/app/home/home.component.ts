import { Component, OnInit, OnDestroy, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { EventService } from '../shared/services/event.service';
import { AuthService } from '../shared/services/auth.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  interval;
  timeLeft;
  days;
  hours;
  mins;
  secs;
  timerObj;
  enableVideoJoiningButton = false;

  twitter_link;
  link_param = '?ref_src=twsrc%5Etfw';
  constructor(
    private router: Router,
    private eventService: EventService,
    private authservice: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private title: Title,
    private meta: Meta
  ) { }

  ngOnInit(): void {

    if (localStorage.getItem('reload')) {
      //window.location.href = 'http://localhost:4200';
      window.location.reload();
      localStorage.removeItem('reload');
    }
    this.twitter_link = 'https://twitter.com/tantraaevents' + this.link_param;

    this.timerObj = this.eventService.timer();
    this.timer();

    // SEO Meta Tags
    this.title.setTitle('Leaders Of Tomorrow - Season 8 | Largest Entrepreneurship Platform | ET NOW');
    this.meta.addTags([
      { name: 'description', content: 'Session On Technology And Innovation For Sustainability. Leaders Of Tomorrow - Season 8 By ET NOW On Friday 29th May Evening 6 PM to 8.30 PM. Register NOW For The Wonderful Session By Largest Entrepreneurship Platform.' },
      { name: 'keywords', content: 'Largest Entrepreneurship Platform by ET NOW, ET NOW, Leaders Of Tomorrow Season 8' }
    ]);

  }


  ngAfterViewInit() {
    console.log('after view init called');
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(function () {
        (<any>window).twttr = (function (d, s, id) {
          let js, fjs = d.getElementsByTagName(s)[0], t = (<any>window).twttr || {};

          if (d.getElementById(id)) return t;
          js = d.createElement(s);
          js.id = id;
          js.src = 'https://platform.twitter.com/widgets.js';
          fjs.parentNode.insertBefore(js, fjs);
          t._e = [];
          t.ready = function (f) {
            t._e.push(f);
          };
          return t;
        }(document, 'script', 'twitter-wjs'));
        (<any>window).twttr.widgets.load();
      }, 1000);

    } //  end of ngAfterviewinit

  }
  timer() {
    console.log(this.timerObj);
    this.days = this.timerObj.days;
    this.hours = this.timerObj.hours;
    this.secs = this.timerObj.secs;
    this.mins = this.timerObj.mins;
    if(this.days >= 0){
    this.interval = setInterval(() => {
      if (this.secs > 0) {
        this.secs--;
      } else {
        if (this.mins > 0) {
          this.mins--;
        } else {
          if (this.hours < 24) {
            this.hours--;
          } else {
            if (this.days > 0) {
              this.days--;
            }
            this.hours = 24;
          }
          this.mins = 60;
        }
        this.secs = 60;
      }
    }, 1000);
  }else{
    this.enableVideoJoiningButton = true;
  }
  }

  navigatetorequestaccess() {
    this.router.navigate(["/auth"]);
  }
  scroll(el: HTMLElement) {
    const pos = el.style.position;
    const top = el.style.top;
    el.style.position = 'relative';
    el.style.top = '-82px';
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.style.top = top;
    el.style.position = pos;

  }
  navigatetologin() {
    this.router.navigate(['/auth/login']); //
  }
}
