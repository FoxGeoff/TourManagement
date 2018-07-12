import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { OpenIdConnectService } from './open-id-connect.service';

@Injectable()
export class RequiredAuthenticatedUserRouteGuardService implements CanActivate {

  constructor(private openIdConnectorService: OpenIdConnectService, private router: Router) { }

  canActivate(){
    if(this.openIdConnectorService.userAvailable) {
      return true;
    }
    else {
      //trigger signin
      this.openIdConnectorService.triggerSignIn();
      return false;
    }
  } 
}
