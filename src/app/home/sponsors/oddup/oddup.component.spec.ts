import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OddupComponent } from './oddup.component';

describe('OddupComponent', () => {
  let component: OddupComponent;
  let fixture: ComponentFixture<OddupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OddupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OddupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
