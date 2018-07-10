# Project Log
***
7/9/2018

IDE Visual Sudio 2017 for TourManagementAPI
IDE VSCode for Angular TourManagementClient

## API setup SSL

API Set as https://localhost:44394/ (44353)

## Client setup SSL:

1. #1 Set this in enviroment.ts:  apiUrl: 'https://localhost:44394'
1. #2 Get Cert from code: certicate.pem and privatekey.key
1. #3 ng serve --ssl 1 -o --ssl-key privatekey.key --ssl-cert certificate.pem

*Note: SSL self signed cert works in Chrome, not Edge or Firefox.*
* Use MMC plugin to install cert on computer and user account.*

1. #4 Setthe defaults of the serve command (angular-cli.json)
```
   },
  "defaults": {
    "styleExt": "css",
    "serve": {
      "ssl": true,
      "sslCert": "certificate.pem",
      "sslKey": "privatekey.key"
    },
````
## Add project IdentityServer

## Creating an OpenID Connect Service
1. Add oidc-client
```
PS npm install oidc-client --save 
PS ng  g service OpenIdConnect
```
### environment.ts
```
export const environment = {
  production: false,
  apiUrl: 'https://localhost:44394/api/', // API
  openIdConnectSettings: {
    authority: 'https://localhost:44398/', // IDP
    client_id: 'tourmanagementclient',
    redirect_uri: 'https://localhost:4200/signin-oidc', // Angular
    scope: 'openid profile roles',
    response_type: 'id_token' // implict flow on access token
  }
};
```
### open-id-connect.services.ts
```
import { Injectable } from '@angular/core';
import { UserManager, User} from 'oidc-client'
import { environment } from '../environments/environment';

@Injectable()
export class OpenIdConnectService {

  private useManager: UserManager;
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
```
1. #1 Now initialise the UserManger (open-id-connect.services.ts)
```private userManager: UserManager =  new UserManager(environment.openIdConnectSettings);```
1. #2 app.module.ts ADD OpenIdConnectService
```
providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: EnsureAcceptHeaderInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: WriteOutJsonInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HandleHttpErrorInterceptor,
      multi: true,
    },
    GlobalErrorHandler, ErrorLoggerService, TourService, MasterDataService, ShowService, DatePipe, OpenIdConnectService],
```
## Adding a Callback Page
 7/10/2018 contributor FoxGeoff
 1. ```> ng g component SigninOidc ```
 1. signin-oidc.component.ts
 ```
import { Component, OnInit } from '@angular/core';
import { OpenIdConnectService } from '../open-id-connect.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin-oidc',
  templateUrl: './signin-oidc.component.html',
  styleUrls: ['./signin-oidc.component.css']
})
export class SigninOidcComponent implements OnInit {

  constructor(private openIdConnectService: OpenIdConnectService, private router: Router) { }

  ngOnInit() {
    this.openIdConnectService.handleCallBack();
    this.router.navigate(['./']);
  }
}
```
1. app.routing.ts
```
{ path: 'signin-oidc', component: SigninOidcComponent }
```
## Sign In
1. app.component.ts
```

```