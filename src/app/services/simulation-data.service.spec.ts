import { TestBed } from '@angular/core/testing';

import { SimulationDataService } from './simulation-data.service';

describe('SimulationDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SimulationDataService = TestBed.get(SimulationDataService);
    expect(service).toBeTruthy();
  });
});
