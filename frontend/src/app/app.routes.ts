import { Routes } from '@angular/router';

import { AchievementsPageComponent } from './components/achievements/achievements-page/achievements-page.component';
import { LeaderboardPageComponent } from './components/leaderboard/leaderboard-page/leaderboard-page.component';
import { ChallengeListPageComponent } from './components/challenges/challenge-list-page/challenge-list-page.component';
import { MyChallengesPageComponent } from './components/challenges/my-challenges-page/my-challenges-page.component';
import { ChallengeDetailPageComponent } from './components/challenges/challenge-detail-page/challenge-detail-page.component';
import { RecommendationPageComponent } from './components/recommendations/recommendation-page/recommendation-page.component';
import { NotificationListPageComponent } from './components/notifications/notification-list-page/notification-list-page.component';
import { AdminChallengeListComponent } from './components/admin/challenges/admin-challenge-list/admin-challenge-list.component';
import { AdminBadgeListComponent } from './components/admin/badges/admin-badge-list/admin-badge-list.component';
import { AdminConfigPageComponent } from './components/admin/config/admin-config-page/admin-config-page.component';

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
import { userGuard } from './guards/user.guard';
import { AdminUsersListComponent } from './components/admin/users-list/users-list';
import { AdminUserDetailsComponent } from './components/admin/user-details/user-details';
import { ForbiddenComponent } from './components/forbidden/forbidden';
import { SuspendedComponent } from './components/suspended/suspended';
import { MainLayoutComponent } from './shared/ui/main-layout/main-layout.component';
import { suspendedGuard } from './guards/suspended.guard';

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
        component: DashboardComponent,
        canActivate: [userGuard, suspendedGuard]
      },
      {
        path: 'carbon-tracker',
        component: CarbonTrackerComponent,
        canActivate: [userGuard, suspendedGuard]
      },
      {
        path: 'goals',
        component: GoalsComponent,
        canActivate: [userGuard, suspendedGuard]
      },
      {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [userGuard, suspendedGuard]
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
        canActivate: [adminGuard, suspendedGuard]
      },
      {
        path: 'admin/users/:id',
        component: AdminUserDetailsComponent,
        canActivate: [adminGuard, suspendedGuard]
      },
      {
        path: 'achievements',
        component: AchievementsPageComponent,
        canActivate: [userGuard, suspendedGuard]
      },
      {
        path: 'leaderboard',
        component: LeaderboardPageComponent,
        canActivate: [userGuard, suspendedGuard]
      },
      {
        path: 'challenges',
        component: ChallengeListPageComponent,
        canActivate: [userGuard, suspendedGuard]
      },
      {
        path: 'challenges/my',
        component: MyChallengesPageComponent,
        canActivate: [userGuard, suspendedGuard]
      },
      {
        path: 'challenges/:id',
        component: ChallengeDetailPageComponent,
        canActivate: [userGuard, suspendedGuard]
      },
      {
        path: 'recommendations',
        component: RecommendationPageComponent,
        canActivate: [userGuard, suspendedGuard]
      },
      {
        path: 'notifications',
        component: NotificationListPageComponent,
        canActivate: [userGuard, suspendedGuard]
      },
      {
        path: 'admin/challenges',
        component: AdminChallengeListComponent,
        canActivate: [adminGuard, suspendedGuard]
      },
      {
        path: 'admin/badges',
        component: AdminBadgeListComponent,
        canActivate: [adminGuard, suspendedGuard]
      },
      {
        path: 'admin/config',
        component: AdminConfigPageComponent,
        canActivate: [adminGuard, suspendedGuard]
      }
    ]
  },
  {
    path: '403',
    component: ForbiddenComponent
  },
  {
    path: 'suspended',
    component: SuspendedComponent
  }
];