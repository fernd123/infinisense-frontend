import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertModule } from '../shared/alert/alert.module';
import { AuthGuard } from '../core/guards/auth.guard';
import { VisitReasonComponent } from './visit-reason/visit-reason.component';

const routes: Routes = [
  { path: 'visit-reason', component: VisitReasonComponent, canActivate: [AuthGuard] }
]

@NgModule({
  declarations: [VisitReasonComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AlertModule,
    RouterModule.forChild(routes)
  ],
  providers:[AuthGuard]
})
export class AdminPagesModule { }
