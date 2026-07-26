import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrapper">
      <div *ngIf="type === 'card'" class="skeleton-card">
        <div class="skeleton-header"></div>
        <div class="skeleton-line w-75"></div>
        <div class="skeleton-line w-50"></div>
        <div class="skeleton-line w-100 mt-3"></div>
      </div>
      
      <div *ngIf="type === 'table'" class="skeleton-table">
        <div class="skeleton-row header"></div>
        <div class="skeleton-row" *ngFor="let i of [1,2,3,4,5]"></div>
      </div>
      
      <div *ngIf="type === 'stat'" class="skeleton-stat">
        <div class="skeleton-circle"></div>
        <div class="skeleton-col">
          <div class="skeleton-line w-50"></div>
          <div class="skeleton-line w-100"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shimmer {
      0% { background-position: -468px 0; }
      100% { background-position: 468px 0; }
    }
    
    .skeleton-header, .skeleton-line, .skeleton-circle, .skeleton-row:not(.header) {
      background: var(--bg-surface-hover, #f1f5f9);
      background-image: linear-gradient(to right, 
        var(--bg-surface-hover, #f1f5f9) 0%, 
        var(--border-color, #e2e8f0) 20%, 
        var(--bg-surface-hover, #f1f5f9) 40%, 
        var(--bg-surface-hover, #f1f5f9) 100%);
      background-repeat: no-repeat;
      background-size: 800px 100%;
      animation: shimmer 1.5s infinite linear forwards;
      border-radius: 6px;
    }
    
    .skeleton-card {
      padding: 1.5rem;
      border-radius: 16px;
      background: var(--bg-surface) !important;
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    
    .skeleton-header { height: 28px; width: 40%; margin-bottom: 1.5rem; }
    .skeleton-line { height: 12px; margin-bottom: 0.8rem; }
    .w-50 { width: 50%; }
    .w-75 { width: 75%; }
    .w-100 { width: 100%; }
    .mt-3 { margin-top: 1rem; }
    
    .skeleton-table {
      border-radius: 16px;
      overflow: hidden;
      background: var(--bg-surface) !important;
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .skeleton-row { height: 60px; border-bottom: 1px solid var(--border-color); border-radius: 0; }
    .skeleton-row.header { height: 48px; background: var(--bg-surface) !important; animation: none; }
    
    .skeleton-stat {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      border-radius: 16px;
      background: var(--bg-surface) !important;
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .skeleton-circle { width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; }
    .skeleton-col { flex-grow: 1; display: flex; flex-direction: column; }
  `]
})
export class LoadingSkeletonComponent {
  @Input() type: 'card' | 'table' | 'stat' = 'card';
}
