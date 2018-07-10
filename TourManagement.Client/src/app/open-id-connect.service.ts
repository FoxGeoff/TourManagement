import { Injectable } from '@angular/core';
import { UserManager, User} from 'oidc-client'
import { environment } from '../environments/environment';

@Injectable()
export class OpenIdConnectService {

  private useManager: UserManager =  new UserManager(environment.openIdConnectSettings);
  private currentUser:  User;

  get userAvailable(): boolean {
    return this.currentUser != null;
  }

  get use(): User {
    return this.currentUser;
  }

  constructor() {
    this.useManager.clearStaleState();

    this.useManager.events.addUserLoaded(user => {
      if (!environment.production){
        console.log('User loaded.', user);
      }
      this.currentUser = user;
    });
   }

  triggerSignIn(){
    this.useManager.signinRedirect().then(function (){
      if (!environment.production){
        console.log('==> Redirection to signin triggered.');
      }
    });
  }

  handleCallBack(){
    this.useManager.signinRedirectCallback().then(function(user){
      if(!environment.production){
        console.log('==> Callback after signin handled', user);
      }
    });
  }
}