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
1. #5 ```ng serve -ss 1 -o --ssl-key private.key --ssl-cert certificate.pem```

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
import { Component } from '@angular/core';
import {  } from "automapper-ts";
import { OpenIdConnectService } from './open-id-connect.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Pluralsight Demo'; 
  
  constructor(private openIdConnectService: OpenIdConnectService){}

  ngOnInit(){
    var path = window.location.pathname;
    if(path != "/signin-oidc") {
      this.openIdConnectService.triggerSignIn();
    }
  }
}

```
1. Check the token content with https://jwt.io

## Sign out
1. #1 Environment.ts Add:
```post_logout_redirect_uri: 'https://localhost:4200/',```
1. #2 open-id-connect.services
```
private useManager: UserManager =  new UserManager(environment.openIdConnectSettings);
``
```

 this.useManager.events.addUserLoaded(user => {
      if (!environment.production){
        console.log('==> User loaded.', user);
      }
      this.currentUser = user;
    });
	//Add here...
    this.useManager.events.addUserUnloaded((e) => {
      if (!environment.production) {
        console.log('User unloaded');
      }
      this.currentUser = null;
    });
``
```

triggerSignOut() {
    this.useManager.signoutRedirect().then(function (resp) {
      if (!environment.production) {
        console.log('=> Redirection to sign out triggered.', resp);
      }
    });
  };
```
1. #3 app.component.html
```
<ul class='nav navbar-nav'>
              <li><a [routerLink]="['/tours']">Tour Management</a></li>
              <li><a [routerLink]="['/about']">About</a></li>
              <li *ngIf='openIdConnectService.userAvailable'>
                <a (click)="openIdConnectService.triggerSignOut()">Sign out</a>
            </li>
          </ul>
```

## Adding Guard Service

1. #1 open-id-connect.service.ts
```
import { Injectable } from '@angular/core';
import { UserManager, User } from 'oidc-client'
import { environment } from '../environments/environment';
import { ReplaySubject } from 'rxjs/ReplaySubject' //added

@Injectable()
export class OpenIdConnectService {

  private useManager: UserManager = new UserManager(environment.openIdConnectSettings);
  private currentUser: User;
  
  userLoaded$ = new ReplaySubject<boolean>(1); //added
```
```
this.useManager.events.addUserLoaded(user => {
      if (!environment.production) {
        console.log('==> User loaded.', user);
      }
      this.currentUser = user;
      this.userLoaded$.next(true); //added
    });

    this.useManager.events.addUserUnloaded((e) => {
      if (!environment.production) {
        console.log('User unloaded');
      }
      this.currentUser = null;
      this.userLoaded$.next(false); //added
    });
```
1. #2 signin-oidc.component.ts
```

import { Component, OnInit } from '@angular/core';
import { OpenIdConnectService } from '../shared/open-id-connect.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-signin-oidc',
  templateUrl: './signin-oidc.component.html',
  styleUrls: ['./signin-oidc.component.css']
})
export class SigninOidcComponent implements OnInit {

  constructor(private openIdConnectService: OpenIdConnectService,
    private router: Router) { }
//added start
  ngOnInit() {
    this.openIdConnectService.userLoaded$.subscribe((userLoaded) => {
      if (userLoaded) {
        this.router.navigate(['./']);
      }
      else {
        if (!environment.production) {
          console.log("An error happened: user wasn't loaded.");
        }
      }
    });

    this.openIdConnectService.handleCallBack();
  }
//end
}
```

1. #3 Add a service
```
cd src/app/shared
ng g service RequiredAuthenticatedUserRouteGuard 
```
1. #4 Now add the code to the service:
```
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
```

1. #5 Update app.route.ts
```
const routes: Routes = [
    // redirect root to the dasbhoard route
    { path: '', redirectTo: 'tours', pathMatch: 'full', 
        canActivate: [RequiredAuthenticatedUserRouteGuardService] },
    { path: 'tours', component: ToursComponent , 
    canActivate: [RequiredAuthenticatedUserRouteGuardService] },
    { path: 'about', component: AboutComponent },
    { path: 'tours/:tourId', component: TourDetailComponent , 
    canActivate: [RequiredAuthenticatedUserRouteGuardService] },
    { path: 'tour-update/:tourId', component: TourUpdateComponent , 
    canActivate: [RequiredAuthenticatedUserRouteGuardService] },
    { path: 'tour-add', component: TourAddComponent, 
    canActivate: [RequiredAuthenticatedUserRouteGuardService] },  
    { path: 'tours/:tourId/show-add', component: ShowAddComponent, 
    canActivate: [RequiredAuthenticatedUserRouteGuardService] },
    { path: 'signin-oidc', component: SigninOidcComponent }
  //  { path: '**', redirectTo: 'tours' },
];
```
1. #6 now we can remove in app.component.ts:
```
//REMOVE THIS CODE
ngOnInit(){
    var path = window.location.pathname;
    if(path != "/signin-oidc") {
      this.openIdConnectService.triggerSignIn();
    }
  }
```

## Using Identity Claims in Our Application

1. In the tour-add-component.ts (we are now checking the user's role')
```
private isAdmin: boolean =
    (this.openIdConnectService.use.profile.role === "Administrator");
```
1. DI OpenIdConnectService
```
constructor(private masterDataService: MasterDataService,
    private tourService: TourService,
    private formBuilder: FormBuilder,
    private router: Router,
    private openIdConnectService: OpenIdConnectService) { }
```
***
* OpenID Connect is an Identity layer on top of the OAuth 2.0 protocol 
	1. Authentication
* OAuth 2.0 is an open protocol to allow secure authorization from web, mobil and desktop applications
	1. Authorization
	1. Access tokens (identy tokens are uae at the level of the client app.)
* An Angular client is a public client
	1. Implict flow
* We cannot protect code that is already on the client.
	1. We can protect code on the API (next step)

# Authorization: Securing the API
## Coming Up
* Using OpenID Connect for Authentication and Authorization
* Blocking and Gaining Access to th API
* Handling Token Expiration

*Implicit Flow*
* OpenID Connect is the superior protocol
	* via front channel - Identity token can be linked to access token (at_hash)
	* Identiy token can be verified first

## Blocking Access to the API

1. Add Nuget Package: IdentityServer4.AccessTokenValidation (to TourManagement.API)
1. In Startup.cs
```public void ConfigureServices(IServiceCollection services)
{
...
//register Authentication Service
services.AddAuthentication(IdentityServerAuthenticationDefaults.AuthenticationScheme)
    .AddIdentityServerAuthentication(options =>
    {
        options.Authority = "https://localhost:44398/";
        options.ApiName = "tourmanagementapi";
    });
}
```
```
public void Configure(IApplicationBuilder app, IHostingEnvironment env){
...

// Enable CORS
    app.UseCors("AllowAllOriginsHeadersAndMethods");

    app.UseAuthentication();

    app.UseMvc();
```
On the controller class
```
namespace TourManagement.API.Controllers
{
    [Route("api/tours")]
    [Authorize]
```
repeat for each controller class

## Requesting an Acess Token with the Correct Audience