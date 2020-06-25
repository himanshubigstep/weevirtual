import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingHallDailogComponent } from './meeting-hall-dailog.component';

describe('MeetingHallDailogComponent', () => {
  let component: MeetingHallDailogComponent;
  let fixture: ComponentFixture<MeetingHallDailogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingHallDailogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingHallDailogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
