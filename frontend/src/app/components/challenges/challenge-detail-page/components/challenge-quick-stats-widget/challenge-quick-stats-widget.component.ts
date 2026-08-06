import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Target, Activity, Users, Settings, Hand } from 'lucide-angular';

@Component({
  selector: 'app-challenge-quick-stats-widget',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './challenge-quick-stats-widget.component.html'
})
export class ChallengeQuickStatsWidgetComponent {
  @Input() challenge: any;
  
  readonly TargetIcon = Target;
  readonly ActivityIcon = Activity;
  readonly UsersIcon = Users;
  readonly SettingsIcon = Settings;
  readonly HandIcon = Hand;
}