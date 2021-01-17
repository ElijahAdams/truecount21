import { TestBed } from '@angular/core/testing';

import { DealingService } from './dealing.service';

describe('DealingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DealingService = TestBed.get(DealingService);
    expect(service).toBeTruthy();
  });
});
