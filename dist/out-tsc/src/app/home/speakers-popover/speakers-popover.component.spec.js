import { async, TestBed } from '@angular/core/testing';
import { SpeakersPopoverComponent } from './speakers-popover.component';
describe('SpeakersPopoverComponent', () => {
    let component;
    let fixture;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SpeakersPopoverComponent]
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
//# sourceMappingURL=speakers-popover.component.spec.js.map