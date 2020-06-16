import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingHallComponent } from './meeting-hall.component';

describe('MeetingHallComponent', () => {
  let component: MeetingHallComponent;
  let fixture: ComponentFixture<MeetingHallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingHallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingHallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
