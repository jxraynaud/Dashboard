import { TestBed, inject } from '@angular/core/testing';

import { DataRequestService } from './data-request.service';

describe('DataRequestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataRequestService]
    });
  });

  it('should ...', inject([DataRequestService], (service: DataRequestService) => {
    expect(service).toBeTruthy();
  }));
});
