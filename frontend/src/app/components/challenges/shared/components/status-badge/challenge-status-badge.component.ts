import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeStatusLabelPipe } from '../../pipes/challenge-status-label.pipe';
import { LucideAngularModule, Circle, ShieldCheck, ShieldAlert, CheckCircle, XCircle, MinusCircle, Clock, Archive } from 'lucide-angular';

@Component({
  selector: 'app-challenge-status-badge',
  standalone: true,
  imports: [CommonModule, ChallengeStatusLabelPipe, LucideAngularModule],
  templateUrl: './challenge-status-badge.component.html',
  styleUrls: ['./challenge-status-badge.component.css']
})
export class ChallengeStatusBadgeComponent {
  @Input() status!: string;
  @Input() size: 'sm' | 'md' = 'sm';

  readonly icons = {
    Circle, ShieldCheck, ShieldAlert, CheckCircle, XCircle, MinusCircle, Clock, Archive
  };

  get badgeClass(): string {
    const base = `badge badge-${this.size}`;
    switch (this.status) {
      case 'ACTIVE':
      case 'WITHIN_BUDGET': return `${base} badge-success`;
      case 'EXCEEDED': return `${base} badge-danger`;
      case 'COMPLETED': return `${base} badge-xp`;
      case 'FAILED':
      case 'DROPPED':
      case 'CLOSED':
      case 'ARCHIVED': return `${base} badge-neutral`;
      case 'PENDING': return `${base} badge-warning`;
      case 'UPCOMING': return `${base} badge-info`;
      default: return `${base} badge-neutral`;
    }
  }

  get iconName(): any {
    switch (this.status) {
      case 'ACTIVE': return this.icons.Circle;
      case 'WITHIN_BUDGET': return this.icons.ShieldCheck;
      case 'EXCEEDED': return this.icons.ShieldAlert;
      case 'COMPLETED': return this.icons.CheckCircle;
      case 'FAILED': return this.icons.XCircle;
      case 'DROPPED': return this.icons.MinusCircle;
      case 'UPCOMING':
      case 'PENDING': return this.icons.Clock;
      case 'CLOSED':
      case 'ARCHIVED': return this.icons.Archive;
      default: return this.icons.Circle;
    }
  }
}
