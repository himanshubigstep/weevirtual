import { TestBed } from '@angular/core/testing';

import { ErrorDialogServiceService } from './error-dialog-service.service';

describe('ErrorDialogServiceService', () => {
  let service: ErrorDialogServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorDialogServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
