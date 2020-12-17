import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertModule } from '../shared/alert/alert.module';
import { AuthGuard } from '../core/guards/auth.guard';
import { SharedModule } from '../shared/shared.module';
import { CompanyComponent } from './company/company.component';
import { CompanySaveComponent } from './company/save/company-save.component';
import { NgxPermissionsGuard, NgxPermissionsModule } from 'ngx-permissions';

const routes: Routes = [
  {
    path: 'company', component: CompanyComponent, canActivate: [AuthGuard, NgxPermissionsGuard], data: {
      permissions: {
        only: 'MASTER',
        redirectTo: '/'
      }
    }
  }
]

@NgModule({
  declarations: [
    CompanyComponent, CompanySaveComponent],
  imports: [
    SharedModule,
    CommonModule,
    ReactiveFormsModule,
    AlertModule,
    NgxPermissionsModule.forChild(),
    RouterModule.forChild(routes)
  ],
  providers: [AuthGuard]
})
export class MasterPagesModule { }
