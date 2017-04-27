import { TestBed, inject } from '@angular/core/testing';

import { DataFiltersService } from './data-filters.service';

describe('DataFiltersService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataFiltersService]
    });
  });

  it('should ...', inject([DataFiltersService], (service: DataFiltersService) => {
    expect(service).toBeTruthy();
  }));
});
