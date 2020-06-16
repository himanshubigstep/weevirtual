import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { AuthComponent } from './auth/auth.component';
import { VerifyRegistrationComponent } from './verify-registration/verify-registration.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: '', component: AuthComponent,
    children: [{
      path: '', component: RegisterComponent
    },
    { path: 'verify/:user_id/:type', component: VerifyRegistrationComponent },
    { path: 'verify/:user_id/:type/:url', component: VerifyRegistrationComponent },
    { path: 'login', component: LoginComponent }
    ]
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
