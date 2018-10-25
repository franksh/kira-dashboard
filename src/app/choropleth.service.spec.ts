import { TestBed, inject } from '@angular/core/testing';

import { ChoroplethService } from './choropleth.service';

describe('ChoroplethService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChoroplethService]
    });
  });

  it('should be created', inject([ChoroplethService], (service: ChoroplethService) => {
    expect(service).toBeTruthy();
  }));
});
