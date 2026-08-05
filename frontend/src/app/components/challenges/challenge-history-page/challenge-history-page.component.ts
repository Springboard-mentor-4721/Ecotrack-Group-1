import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-challenge-history-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 text-center" style="margin-top: 2rem;">
      <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Challenge History</h2>
      <p style="color: #666; margin-bottom: 2rem;">This page is a placeholder for the V2 Challenge History page.</p>
      <a routerLink="/challenges" style="padding: 0.5rem 1rem; background-color: #10b981; color: white; border-radius: 4px; text-decoration: none;">Back to Dashboard</a>
    </div>
  `
})
export class ChallengeHistoryPageComponent {
}
