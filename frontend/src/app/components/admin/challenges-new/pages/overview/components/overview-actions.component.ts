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
      color: #0f172a;
      background: var(--surface-card, #ffffff);
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      border: 1px solid transparent;
    }
    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    }
    .action-card.primary {
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      border-color: #bfdbfe;
    }
    .action-card.primary .material-icons { color: #2563eb; }
    
    .action-card.secondary {
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
      border-color: #e2e8f0;
    }
    .action-card.secondary .material-icons { color: #475569; }
    
    .action-card.tertiary {
      background: linear-gradient(135deg, #faf5ff, #f3e8ff);
      border-color: #e9d5ff;
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
      color: #64748b;
    }
  `]
})
export class OverviewActionsComponent {}
