import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tracking-badge',
  imports: [],
  templateUrl: './tracking-badge.html',
  styleUrl: './tracking-badge.css',
})
export class TrackingBadge {}
