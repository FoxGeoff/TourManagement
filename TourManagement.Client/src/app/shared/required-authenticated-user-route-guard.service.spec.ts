import { TestBed, inject } from '@angular/core/testing';

import { RequiredAuthenticatedUserRouteGuardService } from './required-authenticated-user-route-guard.service';

describe('RequiredAuthenticatedUserRouteGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RequiredAuthenticatedUserRouteGuardService]
    });
  });

  it('should be created', inject([RequiredAuthenticatedUserRouteGuardService], (service: RequiredAuthenticatedUserRouteGuardService) => {
    expect(service).toBeTruthy();
  }));
});
