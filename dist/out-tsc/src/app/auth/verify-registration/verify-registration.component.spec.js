import { async, TestBed } from '@angular/core/testing';
import { VerifyRegistrationComponent } from './verify-registration.component';
describe('VerifyRegistrationComponent', () => {
    let component;
    let fixture;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [VerifyRegistrationComponent]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(VerifyRegistrationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
//# sourceMappingURL=verify-registration.component.spec.js.map