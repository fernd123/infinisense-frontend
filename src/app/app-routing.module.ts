import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { AuthGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './user-pages/login/login.component';


const routes: Routes = [
  { path: '**', redirectTo: 'error-page/404' },
  {
    path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: {
      permissions: {
        only: ['ADMIN', 'USER'],
        redirectTo: '/'
      }
    }
  },
  {
    path: 'basic-ui', loadChildren: () => import('./basic-ui/basic-ui.module').then(m => m.BasicUiModule), data: {
      permissions: {
        only: ['ADMIN', 'USER'],
        redirectTo: '/'
      }
    }
  },
  {
    path: 'charts', loadChildren: () => import('./charts/charts.module').then(m => m.ChartsDemoModule), data: {
      permissions: {
        only: ['ADMIN', 'USER'],
        redirectTo: '/'
      }
    }
  },
  {
    path: 'forms', loadChildren: () => import('./forms/form.module').then(m => m.FormModule), data: {
      permissions: {
        only: ['ADMIN', 'USER'],
        redirectTo: '/'
      }
    }
  },
  {
    path: 'tables', loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule), data: {
      permissions: {
        only: ['ADMIN', 'USER'],
        redirectTo: '/'
      }
    }
  },
  {
    path: 'icons', loadChildren: () => import('./icons/icons.module').then(m => m.IconsModule), data: {
      permissions: {
        only: ['ADMIN', 'USER'],
        redirectTo: '/'
      }
    }
  },
  {
    path: 'general-pages', loadChildren: () => import('./general-pages/general-pages.module').then(m => m.GeneralPagesModule), data: {
      permissions: {
        only: ['ADMIN', 'USER'],
        redirectTo: '/'
      }
    }
  },
  {
    path: 'apps', loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule), data: {
      permissions: {
        only: ['ADMIN', 'USER'],
        redirectTo: '/'
      }
    }
  },
  {
    path: 'user-pages', loadChildren: () => import('./user-pages/user-pages.module').then(m => m.UserPagesModule), data: {
      permissions: {
        only: ['ADMIN', 'USER'],
        redirectTo: '/'
      }
    }
  },
  {
    path: 'error-pages', loadChildren: () => import('./error-pages/error-pages.module').then(m => m.ErrorPagesModule), data: {
      permissions: {
        only: ['ADMIN', 'USER'],
        redirectTo: '/'
      }
    }
  },
  {
    path: 'admin', loadChildren: () => import('./core/login-admin/login-admin.module').then(mod => mod.LoginAdminModule), data: {
      permissions: {
        only: ['ADMIN', 'USER'],
        redirectTo: '/'
      }
    }
  },
  {
    path: 'admin-pages', loadChildren: () => import('./admin-pages/admin-pages.module').then(mod => mod.AdminPagesModule), data: {
      permissions: {
        only: 'ADMIN',
        redirectTo: '/'
      }
    }
  },
  {
    path: 'master-pages', loadChildren: () => import('./master-pages/master-pages.module').then(mod => mod.MasterPagesModule), data: {
      permissions: {
        only: 'MASTER',
        redirectTo: '/'
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
