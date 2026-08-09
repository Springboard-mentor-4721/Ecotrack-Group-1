import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface UrgencyAlert {
  challengeId: number;
  title: string;
  type: 'BUDGET_CRITICAL' | 'EXPIRING_SOON';
  message: string;
}

@Component({
  selector: 'app-urgency-alert-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div *ngIf="alerts && alerts.length > 0" class="mb-5 animate-stagger-item" role="status" aria-live="polite">
      <h3 class="fs-6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ch-text-danger"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        Needs Attention
      </h3>
      
      <div class="d-flex flex-column gap-2">
        <div *ngFor="let alert of alerts | slice:0:3" 
             class="bg-white border rounded-3 p-3 shadow-sm d-flex justify-content-between align-items-center"
             [ngClass]="{'border-danger': alert.type === 'BUDGET_CRITICAL', 'border-warning': alert.type === 'EXPIRING_SOON'}">
          
          <div class="d-flex align-items-center gap-3">
            <div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;"
                 [ngClass]="{'ch-bg-danger bg-opacity-10 ch-text-danger': alert.type === 'BUDGET_CRITICAL', 'ch-bg-warning bg-opacity-10 ch-text-warning': alert.type === 'EXPIRING_SOON'}">
              <svg aria-hidden="true" *ngIf="alert.type === 'BUDGET_CRITICAL'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              <svg aria-hidden="true" *ngIf="alert.type === 'EXPIRING_SOON'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            
            <div>
              <span class="d-block fw-bold text-dark fs-sm">{{ alert.title }}</span>
              <span class="d-block fs-xs text-muted">{{ alert.message }}</span>
            </div>
          </div>
          
          <button [routerLink]="['/challenges', alert.challengeId]" class="btn btn-sm text-primary fw-bold px-3 py-1 bg-primary bg-opacity-10 rounded-pill hover-shadow transition-all" style="font-size: 0.75rem;">
            View
          </button>
        </div>
        
        <div *ngIf="alerts.length > 3" class="text-center mt-2">
          <span class="fs-xs fw-bold text-muted">+{{ alerts.length - 3 }} more challenges need attention</span>
        </div>
      </div>
    </div>
  `
})
export class UrgencyAlertBannerComponent {
  @Input() alerts: UrgencyAlert[] = [];
}
