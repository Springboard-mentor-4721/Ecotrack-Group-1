import { Routes } from '@angular/router';
import { OverviewComponent } from './pages/overview/overview.component';
import { LibraryComponent } from './pages/library/library.component';
import { WizardComponent } from './pages/wizard/wizard.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';

export const routes: Routes = [
  {
    path: '',
    component: OverviewComponent
  },
  {
    path: 'library',
    component: LibraryComponent
  },
  {
    path: 'wizard',
    component: WizardComponent,
    canDeactivate: [unsavedChangesGuard]
  },
  {
    path: 'analytics',
    component: AnalyticsComponent
  }
];
