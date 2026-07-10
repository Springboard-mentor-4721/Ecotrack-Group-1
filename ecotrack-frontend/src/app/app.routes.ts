import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { CarbonTrackerComponent } from './components/carbon-tracker/carbon-tracker';
import { GoalsComponent } from './components/goals/goals';
import { ReportsComponent } from './components/reports/reports';
import { ProfileComponent } from './components/profile/profile';
import { SettingsComponent } from './components/settings/settings';

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
  }
];