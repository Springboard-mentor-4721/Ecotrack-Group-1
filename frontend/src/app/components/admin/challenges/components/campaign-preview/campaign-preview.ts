import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { ChallengeTemplate } from '../../models/challenge-ui.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-campaign-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campaign-preview.html',
  styleUrl: './campaign-preview.css'
})
export class CampaignPreview {
  @Input() challengeForm!: FormGroup;
  @Input() selectedTemplate: ChallengeTemplate | null = null;

  get title(): string {
    return this.challengeForm?.get('title')?.value || 'Untitled Campaign';
  }

  get description(): string {
    return this.challengeForm?.get('description')?.value || 'No description provided.';
  }

  get trackingMethod(): string {
    return this.selectedTemplate?.trackingMethod || 'MANUAL';
  }

  get sustainabilityGroup(): string {
    return this.selectedTemplate?.sustainabilityGroup || 'General';
  }

  get rewardXp(): number {
    return this.challengeForm?.get('rewardXp')?.value || 0;
  }

  get targetValue(): number {
    return this.challengeForm?.get('targetValue')?.value || 1;
  }

  get durationDays(): number {
    const start = this.challengeForm?.get('startDate')?.value;
    const end = this.challengeForm?.get('endDate')?.value;
    if (start && end) {
      const ms = new Date(end).getTime() - new Date(start).getTime();
      const days = ms / (1000 * 60 * 60 * 24);
      return days > 0 ? days : 0;
    }
    return this.selectedTemplate?.durationDays || 0;
  }

  get allowedRulesCount(): number {
    const rules = this.challengeForm?.get('allowedSubcategories')?.value;
    return Array.isArray(rules) ? rules.length : 0;
  }

  get blockedRulesCount(): number {
    const rules = this.challengeForm?.get('blockedSubcategories')?.value;
    return Array.isArray(rules) ? rules.length : 0;
  }
}
