import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overview-status',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="system-status">
      <h2>System Status</h2>
      <div class="status-card">
        <div class="status-item">
          <span class="material-icons" [class.success]="!apiError" [class.error]="apiError">
            {{ apiError ? 'cloud_off' : 'cloud_done' }}
          </span>
          <div class="status-text">
            <strong>Backend Connection</strong>
            <span>{{ apiError ? 'Disconnected' : 'Connected & Healthy' }}</span>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="status-item">
          <span class="material-icons info">update</span>
          <div class="status-text">
            <strong>Last Refresh</strong>
            <span>{{ lastRefresh | date:'medium' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .system-status {
      margin-bottom: 2rem;
    }
    h2 {
      font-size: 1.25rem;
      color: var(--text-primary, #0f172a);
      margin-bottom: 1rem;
    }
    .status-card {
      background: var(--bg-surface);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      gap: 2rem;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    @media (max-width: 600px) {
      .status-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      .divider {
        width: 100%;
        height: 1px !important;
      }
    }
    .status-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .material-icons {
      font-size: 2rem;
    }
    .material-icons.success { color: #10b981; }
    .material-icons.error { color: #ef4444; }
    .material-icons.info { color: #3b82f6; }
    
    .status-text {
      display: flex;
      flex-direction: column;
    }
    .status-text strong {
      color: var(--text-primary);
      font-size: 0.9375rem;
    }
    .status-text span {
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    .divider {
      width: 1px;
      height: 40px;
      background: var(--border-color);
    }
  `]
})
export class OverviewStatusComponent {
  @Input() lastRefresh: Date = new Date();
  @Input() apiError = false;
}
