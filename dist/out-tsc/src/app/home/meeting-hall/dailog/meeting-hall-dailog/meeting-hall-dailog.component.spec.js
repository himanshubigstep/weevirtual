import { async, TestBed } from '@angular/core/testing';
import { MeetingHallDailogComponent } from './meeting-hall-dailog.component';
describe('MeetingHallDailogComponent', () => {
    let component;
    let fixture;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MeetingHallDailogComponent]
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
//# sourceMappingURL=meeting-hall-dailog.component.spec.js.map