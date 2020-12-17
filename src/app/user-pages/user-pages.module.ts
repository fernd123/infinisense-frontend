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
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../app.module';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { RegisterVisitMessageComponent } from './register-vist/message/register-visit-message.component';
import { UpdateProjectComponent } from './update-project/update-project.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { RegisterVisitConfirmationComponent } from './register-vist/confirmation/register-visit-confirmation.component';

const routes: Routes = [
  { path: 'update-project', component: UpdateProjectComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register-visit', component: RegisterVisitComponent, canActivate: [AuthGuard] },

]

@NgModule({
  declarations: [LoginComponent, RegisterComponent, RegisterVisitComponent, RegisterVisitMessageComponent, RegisterVisitConfirmationComponent, UpdateProjectComponent],
  imports: [
    CommonModule,
    SharedModule,
    AlertModule,
    SignaturePadModule,
    NgxPermissionsModule.forChild(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RouterModule.forChild(routes)
  ],
  providers: [AuthGuard]
})
export class UserPagesModule { }
