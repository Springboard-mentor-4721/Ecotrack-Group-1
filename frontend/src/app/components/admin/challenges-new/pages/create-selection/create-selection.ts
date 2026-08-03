import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DEFAULT_CHALLENGE_TEMPLATES, ChallengeTemplate } from '../../challenge-default-templates';

@Component({
  selector: 'app-create-selection',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="create-selection-container p-4 p-md-5">
      <div class="mb-5">
        <button class="btn-back d-flex align-items-center mb-3 text-muted bg-transparent border-0 px-0" routerLink="/admin/challenges">
          <span class="material-icons me-1 fs-5">arrow_back</span> Back to Library
        </button>
        <h1 class="fw-bolder text-dark mb-2" style="font-size: 2.2rem;">Create Challenge</h1>
        <p class="text-muted fs-5">How would you like to begin?</p>
      </div>

      <div class="row g-4 mb-5" *ngIf="!showTemplates()">
        <!-- Option 1: Template -->
        <div class="col-12 col-md-6">
          <div class="option-card h-100 p-5 rounded-4 border bg-white text-center cursor-pointer transition-all hover-shadow-lg" (click)="showTemplates.set(true)">
            <div class="icon-circle bg-emerald bg-opacity-10 text-emerald mb-4 mx-auto d-flex align-items-center justify-content-center rounded-circle" style="width: 80px; height: 80px;">
              <span class="material-icons" style="font-size: 2.5rem;">description</span>
            </div>
            <h3 class="fw-bolder mb-3">Use Template</h3>
            <p class="text-muted mb-4 fs-6">Choose from our ready-made challenge templates</p>
            <button class="btn btn-emerald rounded-pill px-4 py-2 fw-bold">Browse Templates</button>
          </div>
        </div>

        <!-- Option 2: Scratch -->
        <div class="col-12 col-md-6">
          <div class="option-card h-100 p-5 rounded-4 border bg-white text-center cursor-pointer transition-all hover-shadow-lg" (click)="startFromScratch()">
            <div class="icon-circle bg-primary bg-opacity-10 text-primary mb-4 mx-auto d-flex align-items-center justify-content-center rounded-circle" style="width: 80px; height: 80px;">
              <span class="material-icons" style="font-size: 2.5rem;">add_circle_outline</span>
            </div>
            <h3 class="fw-bolder mb-3">Create From Scratch</h3>
            <p class="text-muted mb-4 fs-6">Create a completely custom challenge manually</p>
            <button class="btn btn-primary rounded-pill px-4 py-2 fw-bold">Start Creating</button>
          </div>
        </div>
      </div>

      <!-- Templates Grid -->
      <div class="templates-view" *ngIf="showTemplates()">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-outline-secondary rounded-pill d-flex align-items-center" (click)="showTemplates.set(false)">
              <span class="material-icons me-1 fs-6">arrow_back</span> Back
            </button>
            <h3 class="fw-bolder m-0">Challenge Templates</h3>
          </div>
          
          <div class="search-filter d-flex gap-2">
            <div class="input-group rounded-pill overflow-hidden border">
              <span class="input-group-text bg-white border-0"><span class="material-icons text-muted">search</span></span>
              <input type="text" class="form-control border-0 shadow-none px-0" placeholder="Search templates..." [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)">
            </div>
            <select class="form-select rounded-pill border shadow-none" [ngModel]="categoryFilter()" (ngModelChange)="categoryFilter.set($event)" style="width: 140px;">
              <option value="">All Categories</option>
              <option value="Transport">Transport</option>
              <option value="Waste">Waste</option>
              <option value="Energy">Energy</option>
              <option value="Water">Water</option>
              <option value="Food">Food</option>
              <option value="Nature">Nature</option>
              <option value="Shopping">Shopping</option>
            </select>
            <select class="form-select rounded-pill border shadow-none" [ngModel]="difficultyFilter()" (ngModelChange)="difficultyFilter.set($event)" style="width: 140px;">
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-12 col-md-6 col-lg-4" *ngFor="let t of filteredTemplates()">
            <div class="template-card h-100 p-4 rounded-4 border bg-white d-flex flex-column transition-all hover-shadow-lg position-relative overflow-hidden group">
              <div class="d-flex justify-content-between align-items-start mb-3 position-relative z-1">
                <div class="icon-box rounded-3 d-flex align-items-center justify-content-center" [style.backgroundColor]="t.color + '20'" [style.color]="t.color" style="width: 48px; height: 48px;">
                  <span class="material-icons fs-4">{{ t.icon }}</span>
                </div>
                <div class="badges d-flex flex-column gap-1 align-items-end">
                  <span class="badge bg-light text-dark border">{{ t.recommendedCategory }}</span>
                  <span class="badge" [ngClass]="{'bg-success': t.difficulty === 'Easy', 'bg-warning text-dark': t.difficulty === 'Medium', 'bg-danger': t.difficulty === 'Hard'}">{{ t.difficulty }}</span>
                </div>
              </div>
              
              <h4 class="fw-bolder mb-2 fs-5 position-relative z-1">{{ t.title }}</h4>
              <p class="text-muted fs-sm mb-4 flex-grow-1 position-relative z-1">{{ t.description }}</p>
              
              <div class="template-meta d-flex justify-content-between align-items-center pt-3 border-top position-relative z-1">
                <div class="d-flex align-items-center text-muted fs-xs gap-3 fw-bold">
                  <span class="d-flex align-items-center"><span class="material-icons fs-6 me-1">schedule</span> {{ t.recommendedDurationDays }} days</span>
                  <span class="d-flex align-items-center"><span class="material-icons fs-6 me-1">star</span> {{ t.reward }} XP</span>
                </div>
                <button class="btn btn-sm btn-outline-dark rounded-pill fw-bold" (click)="useTemplate(t)">Use Template</button>
              </div>
            </div>
          </div>
          
          <div class="col-12 text-center py-5" *ngIf="filteredTemplates().length === 0">
            <span class="material-icons text-muted mb-3" style="font-size: 3rem;">search_off</span>
            <h5 class="fw-bold">No templates found</h5>
            <p class="text-muted">Try adjusting your filters or search query.</p>
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
  `]
})
export class CreateSelectionComponent {
  private router = inject(Router);

  showTemplates = signal<boolean>(false);
  templates = signal<ChallengeTemplate[]>(DEFAULT_CHALLENGE_TEMPLATES);
  
  searchQuery = signal<string>('');
  categoryFilter = signal<string>('');
  difficultyFilter = signal<string>('');

  filteredTemplates = computed(() => {
    let result = this.templates();
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(t => t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query));
    }
    const cat = this.categoryFilter();
    if (cat) {
      result = result.filter(t => t.recommendedCategory === cat);
    }
    const diff = this.difficultyFilter();
    if (diff) {
      result = result.filter(t => t.difficulty === diff);
    }
    return result;
  });

  resetFilters() {
    this.searchQuery.set('');
    this.categoryFilter.set('');
    this.difficultyFilter.set('');
  }

  startFromScratch() {
    this.router.navigate(['/admin/challenges/create/wizard']);
  }

  useTemplate(t: ChallengeTemplate) {
    const templateData = {
      title: t.title,
      description: t.description,
      typeCode: t.recommendedCategory.toUpperCase(), // Using recommended category as a fallback typeCode
      trackingMethod: t.trackingMethod,
      carbonCategoryCode: t.carbonCategoryCode,
      progressType: t.goalType,
      rewardXp: t.reward,
      targetValue: t.targetValue,
      rulesConfig: t.rulesConfig
    };

    // Calculate dates based on recommendedDurationDays
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + t.recommendedDurationDays);
    
    // Add dates to templateData
    const finalData = {
      ...templateData,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    this.router.navigate(['/admin/challenges/create/wizard'], { 
      state: { templateData: finalData, isTemplate: true }
    });
  }
}
