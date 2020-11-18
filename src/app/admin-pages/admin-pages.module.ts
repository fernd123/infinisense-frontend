import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertModule } from '../shared/alert/alert.module';
import { AuthGuard } from '../core/guards/auth.guard';
import { VisitReasonComponent } from './visit-reason/visit-reason.component';
import { VisitExternalComponent } from './visit-external/visit-external.component';
import { UserExternalComponent } from './user-external/user-external.component';
import { PlantManagementComponent } from './plant-management/plant-management.component';
import { PlanPlaneComponent } from './plant-management/plane/plant-plane.component';
import { SharedModule } from '../shared/shared.module';
import { PlantCoordsSaveComponent } from './plant-management/plane/save/plant-coords-save.component';

const routes: Routes = [
  { path: 'visit-reason', component: VisitReasonComponent, canActivate: [AuthGuard] },
  { path: 'visit-external', component: VisitExternalComponent, canActivate: [AuthGuard] },
  { path: 'user-external', component: UserExternalComponent, canActivate: [AuthGuard] },
  { path: 'plant-management', component: PlantManagementComponent, canActivate: [AuthGuard] },
  { path: 'plant-plane', component: PlanPlaneComponent, canActivate: [AuthGuard] },
]

@NgModule({
  declarations: [VisitReasonComponent, VisitExternalComponent, UserExternalComponent, PlantManagementComponent, PlanPlaneComponent, PlantCoordsSaveComponent],
  imports: [
    SharedModule,
    CommonModule,
    ReactiveFormsModule,
    AlertModule,
    RouterModule.forChild(routes)
  ],
  providers: [AuthGuard]
})
export class AdminPagesModule { }
