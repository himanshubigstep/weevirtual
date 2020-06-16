import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WadhwaniComponent } from './wadhwani.component';

describe('WadhwaniComponent', () => {
  let component: WadhwaniComponent;
  let fixture: ComponentFixture<WadhwaniComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WadhwaniComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WadhwaniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
