import { Routes } from '@angular/router';
import { LibraryComponent } from './pages/library/library.component';
import { WizardComponent } from './pages/wizard/wizard.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { DetailComponent } from './pages/detail/detail';
import { CreateSelectionComponent } from './pages/create-selection/create-selection';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';

export const routes: Routes = [
  {
    path: '',
    component: LibraryComponent
  },
  {
    path: 'library',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'create',
    component: CreateSelectionComponent
  },
  {
    path: 'create/wizard',
    component: WizardComponent,
    canDeactivate: [unsavedChangesGuard]
  },
  {
    path: ':id/edit',
    component: WizardComponent,
    canDeactivate: [unsavedChangesGuard]
  },
  {
    path: 'analytics',
    component: AnalyticsComponent
  },
  {
    path: ':id',
    component: DetailComponent
  },
  {
    path: ':id/participants',
    loadComponent: () => import('./pages/participants/participants.component').then(m => m.ParticipantsComponent)
  }
];
