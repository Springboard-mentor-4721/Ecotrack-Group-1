import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeStats } from '../../../../../../models/challenge.models';

@Component({
  selector: 'app-overview-stats',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-title">Total Challenges</div>
        <div class="stat-value">{{ loading ? '-' : stats?.totalChallenges || 0 }}</div>
      </div>
      <div class="stat-card active">
        <div class="stat-title">Active</div>
        <div class="stat-value">{{ loading ? '-' : stats?.activeCount || 0 }}</div>
      </div>
      <div class="stat-card upcoming">
        <div class="stat-title">Upcoming</div>
        <div class="stat-value">{{ loading ? '-' : stats?.scheduledCount || 0 }}</div>
      </div>
      <div class="stat-card completed">
        <div class="stat-title">Completed</div>
        <div class="stat-value">{{ loading ? '-' : stats?.completedCount || 0 }}</div>
      </div>
      <div class="stat-card archived">
        <div class="stat-title">Archived</div>
        <div class="stat-value">{{ loading ? '-' : stats?.archivedCount || 0 }}</div>
      </div>
      <div class="stat-card participants">
        <div class="stat-title">Participants</div>
        <div class="stat-value">{{ loading ? '-' : stats?.totalParticipants || 0 }}</div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: var(--bg-surface);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      border-left: 4px solid var(--border-color);
      transition: transform 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-2px);
    }
    .stat-card.active { border-color: #10b981; }
    .stat-card.upcoming { border-color: #3b82f6; }
    .stat-card.completed { border-color: #8b5cf6; }
    .stat-card.archived { border-color: #64748b; }
    .stat-card.participants { border-color: #f59e0b; }
    
    .stat-title {
      color: var(--text-muted);
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-top: 0.5rem;
    }
  `]
})
export class OverviewStatsComponent {
  @Input() stats: ChallengeStats | null = null;
  @Input() loading = false;
}
