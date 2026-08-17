import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DEFAULT_CHALLENGE_TEMPLATES } from '../../challenge-default-templates';
import { ChallengeTemplate } from '../../../../../models/challenge-template.model';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-create-selection',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="create-selection-container p-4 p-md-5">
      <div class="templates-view">
        <button class="btn-back d-flex align-items-center mb-4 text-muted bg-transparent border-0 px-0" routerLink="/admin/challenges">
          <span class="material-icons me-1 fs-5">arrow_back</span> Back to Library
        </button>
        <h1 class="fw-bolder text-dark mb-4" style="font-size: 2.2rem;">Create Challenge</h1>

        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div class="d-flex align-items-center gap-3">
            <h3 class="fw-bolder m-0">Select a Template</h3>
          </div>
          
          <div class="search-filter d-flex gap-2">
            <div class="input-group rounded-pill overflow-hidden border">
              <span class="input-group-text bg-white border-0"><span class="material-icons text-muted">search</span></span>
              <input type="text" class="form-control border-0 shadow-none px-0" placeholder="Search templates..." [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)">
            </div>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-12 col-md-6 col-lg-4" *ngFor="let t of filteredTemplates()">
            <div class="template-card h-100 rounded-4 border bg-white d-flex flex-column transition-all hover-shadow-lg position-relative overflow-hidden group">
              <!-- Hero Image -->
              <div class="template-img-header position-relative" [style.backgroundColor]="'#10b981'" style="display:flex; justify-content:center; align-items:center; overflow:hidden;">
                <img *ngIf="t.imagePath" [src]="getImageUrl(t.imagePath)" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:1;" (error)="handleImageError(t)" />
                <span class="material-icons" style="font-size:3rem; color:white; position:relative; z-index:2;" *ngIf="!t.imagePath">eco</span>
                <div class="overlay-gradient" style="z-index:3;"></div>
                <div class="badges-top d-flex gap-2 position-absolute w-100 p-3" style="top:0; left:0; justify-content: space-between; z-index:4;">
                  <span class="badge bg-dark border">{{ t.category }}</span>
                  <span class="badge" [style.backgroundColor]="t.badgeColor">{{ t.trackingMethod }}</span>
                </div>
              </div>
              
              <div class="p-4 d-flex flex-column flex-grow-1">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h4 class="fw-bolder m-0 fs-5 text-dark">{{ t.title }}</h4>
                </div>
                
                <p class="text-muted fs-sm mb-4 flex-grow-1 lh-sm">{{ t.description }}</p>
                
                <div class="metrics-grid grid mb-3 p-3 bg-light rounded-3" style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem;">
                  <div class="metric-item d-flex flex-column align-items-center text-center">
                    <span class="text-uppercase text-muted fw-bold" style="font-size:0.65rem; letter-spacing:0.5px;">Goal Target</span>
                    <span class="fw-bold fs-6 text-dark">{{ t.goalTarget }} {{ t.goalUnit }}</span>
                  </div>
                  <div class="metric-item d-flex flex-column align-items-center text-center">
                    <span class="text-uppercase text-muted fw-bold" style="font-size:0.65rem; letter-spacing:0.5px;">Duration</span>
                    <span class="fw-bold fs-6 text-dark">{{ t.durationDays }} Days</span>
                  </div>
                  <div class="metric-item d-flex flex-column align-items-center text-center">
                    <span class="text-uppercase text-muted fw-bold" style="font-size:0.65rem; letter-spacing:0.5px;">Reward</span>
                    <span class="fw-bold fs-6 text-warning d-flex align-items-center"><span class="material-icons fs-6 me-1">star</span>{{ t.rewardXP }} XP</span>
                  </div>
                  <div class="metric-item d-flex flex-column align-items-center text-center">
                    <span class="text-uppercase text-muted fw-bold" style="font-size:0.65rem; letter-spacing:0.5px;">Difficulty</span>
                    <span class="fw-bold fs-6 text-dark">{{ t.difficulty }}</span>
                  </div>
                </div>

                <div class="d-flex justify-content-center pt-2">
                  <button class="btn btn-dark rounded-pill fw-bold px-4" (click)="useTemplate(t)">Use Template</button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-12 text-center py-5" *ngIf="filteredTemplates().length === 0">
            <span class="material-icons text-muted mb-3" style="font-size: 3rem;">search_off</span>
            <h5 class="fw-bold">No templates found</h5>
            <button class="btn btn-outline-primary rounded-pill mt-2" (click)="resetFilters()">Clear Filters</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-selection-container { background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .cursor-pointer { cursor: pointer; }
    .hover-shadow-lg:hover { box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1) !important; transform: translateY(-3px); }
    .transition-all { transition: all 0.3s ease; }
    .bg-emerald { background-color: #10b981 !important; }
    .text-emerald { color: #10b981 !important; }
    .btn-emerald { background-color: #10b981; color: white; border: none; }
    .btn-emerald:hover { background-color: #059669; color: white; }
    .template-card:hover .icon-box { transform: scale(1.1); transition: transform 0.3s ease; }
    .input-group:focus-within { box-shadow: 0 0 0 0.25rem rgba(13,110,253,.25); border-color: #86b7fe !important; }
    .form-select:focus { border-color: #86b7fe; box-shadow: 0 0 0 0.25rem rgba(13,110,253,.25); }
    
    .template-img-header { height: 180px; width: 100%; border-bottom: 1px solid #e2e8f0; }
    .overlay-gradient { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 100%); }

  `]
})
export class CreateSelectionComponent {
  private router = inject(Router);


  templates = signal<ChallengeTemplate[]>(DEFAULT_CHALLENGE_TEMPLATES);
  
  searchQuery = signal<string>('');

  filteredTemplates = computed(() => {
    let result = this.templates();
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(t => t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query) || t.category.toLowerCase().includes(query));
    }
    return result;
  });

  handleImageError(template: any) {
    template.imagePath = null;
  }

  getImageUrl(path: string | undefined): string {
    if (!path) return '';
    return encodeURI(`${environment.apiUrl}/${path}`);
  }

  resetFilters() {
    this.searchQuery.set('');
  }

  startFromScratch() {
    this.router.navigate(['/admin/challenges/create/wizard']);
  }

  useTemplate(t: ChallengeTemplate) {
    const templateData = {
      id: t.id,
      title: t.title,
      description: t.description,
      trackingMethod: t.trackingMethod,
      trackingSources: t.trackingSources,
      challengeEvaluationType: t.challengeEvaluationType,
      progressMetric: t.progressMetric,
      rewardXp: t.rewardXP,
      targetValue: t.goalTarget,
      imageUrl: t.imagePath,
      durationDays: t.durationDays,
      badgeId: t.badgeId || null
    };
    
    // Calculate dates based on durationDays (in local timezone)
    const startDate = new Date();
    const sy = startDate.getFullYear();
    const sm = String(startDate.getMonth() + 1).padStart(2, '0');
    const sd = String(startDate.getDate()).padStart(2, '0');
    const startStr = `${sy}-${sm}-${sd}`;
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + t.durationDays);
    const ey = endDate.getFullYear();
    const em = String(endDate.getMonth() + 1).padStart(2, '0');
    const ed = String(endDate.getDate()).padStart(2, '0');
    const endStr = `${ey}-${em}-${ed}`;

    // Add dates to templateData
    const finalData = {
      ...templateData,
      startDate: startStr,
      endDate: endStr
    };

    this.router.navigate(['/admin/challenges/create/wizard'], { 
      state: { templateData: finalData, isTemplate: true }
    });
  }
}
