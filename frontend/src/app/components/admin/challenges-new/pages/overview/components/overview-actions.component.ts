import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overview-actions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="actions-section">
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        <a routerLink="wizard" class="action-card primary">
          <span class="material-icons">add_circle</span>
          <div class="action-text">
            <h3>Create Challenge</h3>
            <p>Launch a new Challenge using the wizard</p>
          </div>
        </a>
        <a routerLink="library" class="action-card secondary">
          <span class="material-icons">inventory_2</span>
          <div class="action-text">
            <h3>View Library</h3>
            <p>Browse and manage all challenges</p>
          </div>
        </a>
        <a routerLink="analytics" class="action-card tertiary">
          <span class="material-icons">insights</span>
          <div class="action-text">
            <h3>Analytics</h3>
            <p>View detailed performance metrics</p>
          </div>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .actions-section {
      margin-bottom: 2rem;
    }
    h2 {
      font-size: 1.25rem;
      color: var(--text-primary, #0f172a);
      margin-bottom: 1rem;
    }
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    .action-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.2s;
      color: var(--text-primary);
      background: var(--bg-surface);
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      border: 1px solid var(--border-color);
    }
    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    }
    .action-card.primary {
      background: rgba(59, 130, 246, 0.08);
      border-color: rgba(59, 130, 246, 0.25);
    }
    .action-card.primary .material-icons { color: #2563eb; }
    
    .action-card.secondary {
      background: var(--bg-surface-hover);
      border-color: var(--border-color);
    }
    .action-card.secondary .material-icons { color: var(--text-muted); }
    
    .action-card.tertiary {
      background: rgba(168, 85, 247, 0.08);
      border-color: rgba(168, 85, 247, 0.25);
    }
    .action-card.tertiary .material-icons { color: #9333ea; }
    
    .material-icons {
      font-size: 2.5rem;
    }
    .action-text h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      font-weight: 600;
    }
    .action-text p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
  `]
})
export class OverviewActionsComponent {}
