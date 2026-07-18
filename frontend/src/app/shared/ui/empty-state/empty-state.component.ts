import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="empty-state-wrapper animate-fade-in">
      <div class="icon-circle" [ngClass]="theme">
        <ng-content select="[icon]"></ng-content>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
      
      <div class="action-container" *ngIf="actionLabel">
        <button class="premium-btn" [ngClass]="'premium-btn-' + theme" (click)="onAction()">
          <ng-content select="[btn-icon]"></ng-content>
          {{ actionLabel }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .empty-state-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 4rem 2rem;
      width: 100%;
    }
    .icon-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    .icon-circle.primary { background: var(--color-primary-light); color: var(--color-primary); }
    .icon-circle.carbon { background: var(--color-carbon-light); color: var(--color-carbon); }
    .icon-circle.profile { background: var(--color-profile-light); color: var(--color-profile); }
    .icon-circle.admin { background: rgba(51, 65, 85, 0.1); color: var(--color-admin); }
    
    .empty-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--color-text-main);
      margin-bottom: 0.5rem;
    }
    .empty-description {
      font-size: 1rem;
      color: var(--color-text-muted);
      max-width: 400px;
      margin: 0 auto 2rem;
    }
  `]
})
export class EmptyStateComponent {
  @Input() title: string = 'No data found';
  @Input() description: string = 'There is currently no data to display in this section.';
  @Input() actionLabel?: string;
  @Input() actionLink?: string;
  @Input() theme: 'primary' | 'carbon' | 'profile' | 'admin' = 'primary';
  @Input() actionHandler?: () => void;

  onAction() {
    if (this.actionHandler) {
      this.actionHandler();
    }
  }
}
