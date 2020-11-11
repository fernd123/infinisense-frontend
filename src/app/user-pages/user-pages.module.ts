import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { Routes, RouterModule } from '@angular/router';
import { RegisterVisitComponent } from './register-vist/register-visit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertModule } from '../shared/alert/alert.module';
import { SignaturePadModule } from 'angular2-signaturepad';
import { AuthGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register-visit', component: RegisterVisitComponent, canActivate: [AuthGuard]
},

]

@NgModule({
  declarations: [LoginComponent, RegisterComponent, RegisterVisitComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AlertModule,
    SignaturePadModule,
    RouterModule.forChild(routes)
  ],
  providers:[AuthGuard]
})
export class UserPagesModule { }
