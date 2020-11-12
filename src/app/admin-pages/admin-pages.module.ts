import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertModule } from '../shared/alert/alert.module';
import { AuthGuard } from '../core/guards/auth.guard';
import { VisitReasonComponent } from './visit-reason/visit-reason.component';
import { VisitExternalComponent } from './visit-external/visit-external.component';

const routes: Routes = [
  { path: 'visit-reason', component: VisitReasonComponent, canActivate: [AuthGuard] },
  { path: 'visit-external', component: VisitExternalComponent, canActivate: [AuthGuard] }

]

@NgModule({
  declarations: [VisitReasonComponent, VisitExternalComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AlertModule,
    RouterModule.forChild(routes)
  ],
  providers:[AuthGuard]
})
export class AdminPagesModule { }
