import { TestBed, inject } from '@angular/core/testing';

import { DisplayControlService } from './display-control.service';

describe('DisplayControlService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DisplayControlService]
    });
  });

  it('should be created', inject([DisplayControlService], (service: DisplayControlService) => {
    expect(service).toBeTruthy();
  }));
});
