import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeakersPopoverComponent } from './speakers-popover.component';

describe('SpeakersPopoverComponent', () => {
  let component: SpeakersPopoverComponent;
  let fixture: ComponentFixture<SpeakersPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeakersPopoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeakersPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
