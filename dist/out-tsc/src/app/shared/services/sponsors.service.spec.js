import { TestBed } from '@angular/core/testing';
import { SponsorsService } from './sponsors.service';
describe('SponsorsService', () => {
    let service;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SponsorsService);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
//# sourceMappingURL=sponsors.service.spec.js.map