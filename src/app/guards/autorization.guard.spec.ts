import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { autorizationGuard } from './autorization.guard';

describe('autorizationGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => autorizationGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
