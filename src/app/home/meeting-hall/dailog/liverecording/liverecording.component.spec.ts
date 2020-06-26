import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiverecordingComponent } from './liverecording.component';

describe('LiverecordingComponent', () => {
  let component: LiverecordingComponent;
  let fixture: ComponentFixture<LiverecordingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiverecordingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiverecordingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
