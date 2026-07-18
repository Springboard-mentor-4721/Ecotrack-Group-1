import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { CarbonTrackerComponent } from './components/carbon-tracker/carbon-tracker';
import { GoalsComponent } from './components/goals/goals';
import { ReportsComponent } from './components/reports/reports';
import { ProfileComponent } from './components/profile/profile';
import { SettingsComponent } from './components/settings/settings';
import { OAuth2SuccessComponent } from './components/oauth2-success/oauth2-success';
import { ResetPasswordComponent } from './components/reset-password/reset-password';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { AdminUsersListComponent } from './components/admin/users-list/users-list';
import { AdminUserDetailsComponent } from './components/admin/user-details/user-details';
import { ForbiddenComponent } from './components/forbidden/forbidden';
import { MainLayoutComponent } from './shared/ui/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  {
    path: 'oauth2/success',
    component: OAuth2SuccessComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'carbon-tracker',
        component: CarbonTrackerComponent
      },
      {
        path: 'goals',
        component: GoalsComponent
      },
      {
        path: 'reports',
        component: ReportsComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'admin/users',
        component: AdminUsersListComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'admin/users/:id',
        component: AdminUserDetailsComponent,
        canActivate: [adminGuard]
      }
    ]
  },
  {
    path: '403',
    component: ForbiddenComponent
  }
];