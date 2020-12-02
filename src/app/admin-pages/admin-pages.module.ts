import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertModule } from '../shared/alert/alert.module';
import { AuthGuard } from '../core/guards/auth.guard';
import { VisitReasonComponent } from './visit-reason/visit-reason.component';
import { VisitExternalComponent } from './visit-external/visit-external.component';
import { SharedModule } from '../shared/shared.module';
import { SensorTypeComponent } from './sensor-type/sensor-type.component';
import { UserExternalComponent } from './user-external/user-external.component';
import { PlantManagementComponent } from './plant-management/plant-management.component';
import { PlanPlaneComponent } from './plant-management/plane/plant-plane.component';
import { PlantManagementSaveComponent } from './plant-management/save/plant-management-save.component';
import { PlantCoordsSaveComponent } from './plant-management/plane/save/plant-coords-save.component';
import { SensorTypeSaveComponent } from './sensor-type/save/sensor-type-save.component';
import { VisitReasonSaveComponent } from './visit-reason/save/visit-reason-save.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { UserManagementSaveComponent } from './user-management/save/user-management-save.component';
import { PlantSensorComponent } from './plant-sensor/plant-sensor.component';
import { PlantSensorSaveComponent } from './plant-sensor/save/plant-sensor-save.component';
import { EpiSaveComponent } from './epis/save/epis-save.component';
import { EpiComponent } from './epis/epis.component';

const routes: Routes = [
  {
    path: 'user-management', component: UserManagementComponent, canActivate: [AuthGuard], data: {
      permissions: {
        only: 'ADMIN',
        redirectTo: '/dashboard'
      }
    }
  },
  {
    path: 'user-external', component: UserExternalComponent, canActivate: [AuthGuard], data: {
      permissions: {
        only: 'ADMIN',
        redirectTo: '/dashboard'
      }
    }
  },
  { path: 'visit-reason', component: VisitReasonComponent, canActivate: [AuthGuard] },
  { path: 'visit-external', component: VisitExternalComponent, canActivate: [AuthGuard] },
  { path: 'plant-management', component: PlantManagementComponent, canActivate: [AuthGuard] },
  { path: 'plant-plane', component: PlanPlaneComponent, canActivate: [AuthGuard] },
  { path: 'plant-sensor', component: PlantSensorComponent, canActivate: [AuthGuard] },
  { path: 'sensor-type', component: SensorTypeComponent, canActivate: [AuthGuard] },
  { path: 'epis', component: EpiComponent, canActivate: [AuthGuard] }
]

@NgModule({
  declarations: [
    UserManagementComponent, UserManagementSaveComponent, UserExternalComponent,
    VisitReasonComponent, VisitReasonSaveComponent, VisitExternalComponent,
    PlantManagementComponent, PlanPlaneComponent, PlantManagementSaveComponent, PlantCoordsSaveComponent, PlantSensorComponent, PlantSensorSaveComponent,
    SensorTypeComponent, SensorTypeSaveComponent,
    EpiSaveComponent, EpiComponent],
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
