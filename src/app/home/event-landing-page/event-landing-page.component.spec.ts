import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventLandingPageComponent } from './event-landing-page.component';

describe('EventLandingPageComponent', () => {
  let component: EventLandingPageComponent;
  let fixture: ComponentFixture<EventLandingPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventLandingPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
