import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { clientAccessGuard } from './client-access.guard';

describe('clientAccessGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => clientAccessGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
