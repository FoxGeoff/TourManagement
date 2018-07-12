import { Routes, RouterModule } from '@angular/router';

import { AboutComponent } from './about'; 
import { AppComponent } from './app.component';
import { ToursComponent, TourDetailComponent, TourUpdateComponent, TourAddComponent } from './tours';

import { NgModule } from '@angular/core';
import { ShowAddComponent } from './tours/shows/index';
import { SigninOidcComponent } from './signin-oidc/signin-oidc.component';
import { RequiredAuthenticatedUserRouteGuardService } from './shared/required-authenticated-user-route-guard.service';

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

// define a module
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule { }
