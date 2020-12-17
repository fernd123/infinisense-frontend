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
import { CompanyCustomerComponent } from './company-customer/company-customer.component';
import { VisitEpisComponent } from './visit-external/epis/visit-epis.component';
import { SignaturePadModule } from 'angular2-signaturepad';
import { NgxPermissionsGuard, NgxPermissionsModule } from 'ngx-permissions';
import { MessagesComponent } from './messages/messages.component';
import { MessagesSaveComponent } from './messages/save/messages-save.component';
import { VisitCancelComponent } from './visit-external/cancel/visit-cancel.component';

const routes: Routes = [
  {
    path: 'company-customer', component: CompanyCustomerComponent, canActivate: [AuthGuard, NgxPermissionsGuard], data: {
      permissions: {
        only: ['ADMIN', 'USER'],
        redirectTo: '/dashboard'
      }
    }
  },
  {
    path: 'user-management', component: UserManagementComponent, canActivate: [AuthGuard, NgxPermissionsGuard], data: {
      permissions: {
        only: 'ADMIN',
        redirectTo: '/dashboard'
      }
    }
  },
  {
    path: 'user-external', component: UserExternalComponent, canActivate: [AuthGuard, NgxPermissionsGuard], data: {
      permissions: {
        only: ['ADMIN', 'USER'],
        redirectTo: '/dashboard'
      }
    }
  },
  {
    path: 'visit-reason', component: VisitReasonComponent, canActivate: [AuthGuard, NgxPermissionsGuard], data: {
      permissions: {
        only: ['ADMIN'],
        redirectTo: '/dashboard'
      }
    }
  },
  {
    path: 'visit-external', component: VisitExternalComponent, canActivate: [AuthGuard, NgxPermissionsGuard], data: {
      permissions: {
        only: ['ADMIN', 'USER'],
        redirectTo: '/dashboard'
      }
    }
  },
  {
    path: 'plant-management', component: PlantManagementComponent, canActivate: [AuthGuard, NgxPermissionsGuard],
    data: {
      permissions: {
        only: ['ADMIN'],
        redirectTo: '/dashboard'
      }
    }
  },
  {
    path: 'plant-plane', component: PlanPlaneComponent, canActivate: [AuthGuard, NgxPermissionsGuard], data: {
      permissions: {
        only: 'ADMIN',
        redirectTo: '/dashboard'
      }
    }
  },
  {
    path: 'plant-sensor', component: PlantSensorComponent, canActivate: [AuthGuard, NgxPermissionsGuard], data: {
      permissions: {
        only: 'ADMIN',
        redirectTo: '/dashboard'
      }
    }
  },
  {
    path: 'sensor-type', component: SensorTypeComponent, canActivate: [AuthGuard, NgxPermissionsGuard], data: {
      permissions: {
        only: 'ADMIN',
        redirectTo: '/dashboard'
      }
    }
  },
  {
    path: 'epis', component: EpiComponent, canActivate: [AuthGuard, NgxPermissionsGuard], data: {
      permissions: {
        only: 'ADMIN',
        redirectTo: '/dashboard'
      }
    }
  },
  {
    path: 'messages', component: MessagesComponent, canActivate: [AuthGuard, NgxPermissionsGuard], data: {
      permissions: {
        only: 'ADMIN',
        redirectTo: '/dashboard'
      }
    }
  }
]

@NgModule({
  declarations: [
    CompanyCustomerComponent,
    MessagesComponent, MessagesSaveComponent,
    UserManagementComponent, UserManagementSaveComponent, UserExternalComponent,
    VisitReasonComponent, VisitReasonSaveComponent, VisitExternalComponent, VisitEpisComponent, VisitCancelComponent,
    PlantManagementComponent, PlanPlaneComponent, PlantManagementSaveComponent, PlantCoordsSaveComponent, PlantSensorComponent, PlantSensorSaveComponent,
    SensorTypeComponent, SensorTypeSaveComponent,
    EpiSaveComponent, EpiComponent],
  imports: [
    SharedModule,
    CommonModule,
    SignaturePadModule,
    ReactiveFormsModule,
    AlertModule,
    NgxPermissionsModule.forChild(),
    RouterModule.forChild(routes)
  ],
  providers: [AuthGuard]
})
export class AdminPagesModule { }
