import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChallengeService } from '../../../services/challenge.service';
import { Challenge, ChallengeDetail, ChallengeParticipant, MyChallengeEntry } from '../../../models/challenge.models';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, map, switchMap, finalize } from 'rxjs/operators';
import { AdminChallengeService } from '../../admin/challenges-new/services/admin-challenge.service';

import { DashboardHeroComponent } from './components/dashboard-hero/dashboard-hero.component';

import { UrgencyAlertBannerComponent, UrgencyAlert } from './components/urgency-alert-banner/urgency-alert-banner.component';
import { DashboardQuickActionsComponent } from './components/dashboard-quick-actions/dashboard-quick-actions.component';
import { MyChallengeCardComponent } from '../shared/components/my-challenge-card/my-challenge-card.component';
import { ChallengeCardComponent } from '../shared/components/challenge-card/challenge-card.component';

@Component({
  selector: 'app-challenges-dashboard-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    LoadingSkeletonComponent, 
    DashboardHeroComponent,

    UrgencyAlertBannerComponent,
    DashboardQuickActionsComponent,
    MyChallengeCardComponent,
    ChallengeCardComponent
  ],
  templateUrl: './challenges-dashboard-page.component.html',
  styleUrls: ['./challenges-dashboard-page.component.css']
})
export class ChallengesDashboardPageComponent implements OnInit {
  isLoading = true;
  
  // Data segments for challenges
  myActiveChallenges: MyChallengeEntry[] = [];
  myCompletedChallenges: MyChallengeEntry[] = [];
  exploreChallenges: Challenge[] = [];
  recommendedChallenges: Challenge[] = [];

  // Stats
  totalXpEarned = 0;
  
  urgencyAlerts: UrgencyAlert[] = [];
  
  Math = Math;

  constructor(
    private challengeService: ChallengeService,
    private adminChallengeService: AdminChallengeService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // ARCHITECTURE NOTE (Phase 1 Container/Presentational):
    // The Dashboard employs an N+1 loading strategy to stitch together participant progress
    // and full challenge details. It limits the initial fetch to `size=100` to cap the
    // concurrent request overhead. In Phase 3, this should be optimized by a backend DTO 
    // that returns full details in a single request.
    
    // ForkJoin to get both my challenges and explore challenges at the same time
    forkJoin({
      my: this.challengeService.getMyChallenges(0, 100).pipe(
        switchMap(res => {
          if (res.content.length === 0) return of([]);
          return forkJoin(res.content.map(p => 
            this.challengeService.getChallengeDetail(p.challengeId).pipe(
              map(c => ({ participant: p, challenge: c } as MyChallengeEntry)),
              catchError(() => of(null))
            )
          ));
        }),
        map(results => results.filter(r => r !== null) as MyChallengeEntry[])
      ),
      explore: this.challengeService.getChallenges(0, 20).pipe(
        map(res => res.content),
        catchError(() => of([]))
      )
    }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        const myChallenges = data.my;
        this.myActiveChallenges = myChallenges.filter(c => ['ACTIVE', 'WITHIN_BUDGET', 'EXCEEDED'].includes(c.participant.status));
        this.myCompletedChallenges = myChallenges.filter(c => ['COMPLETED', 'FAILED', 'DROPPED'].includes(c.participant.status));
        
        // Calculate total XP
        this.totalXpEarned = this.myCompletedChallenges.reduce((sum, c) => sum + (c.challenge.rewardXp || 0), 0);
        
        // The backend now natively filters out challenges we've already joined
        this.exploreChallenges = data.explore;
        
        this.recommendedChallenges = this.exploreChallenges
          .filter(c => c.status === 'ACTIVE')
          .slice(0, 3); // top 3 recommended
          
        // Compute Alerts
        const alerts: UrgencyAlert[] = [];
        const now = new Date().getTime();
        this.myActiveChallenges.forEach(entry => {
          if (entry.challenge.challengeEvaluationType === 'BUDGET') {
            const usage = entry.participant.progress / (entry.challenge.targetValue || 1);
            if (usage >= 0.8) {
              alerts.push({
                challengeId: entry.challenge.id,
                title: entry.challenge.title,
                type: 'BUDGET_CRITICAL',
                message: usage >= 1 ? 'Budget exceeded!' : 'Approaching budget limit'
              });
            }
          }
          if (entry.challenge.endDate) {
            const end = new Date(entry.challenge.endDate).getTime();
            const days = Math.max(0, Math.ceil((end - now) / (1000 * 3600 * 24)));
            if (days <= 2) {
              alerts.push({
                challengeId: entry.challenge.id,
                title: entry.challenge.title,
                type: 'EXPIRING_SOON',
                message: `${days} days remaining`
              });
            }
          }
        });
        this.urgencyAlerts = alerts;
      },
      error: (err) => {
        console.error('Error loading dashboard', err);
      }
    });
  }

  getProgressPercentage(participant: ChallengeParticipant, challenge: ChallengeDetail): number {
    if (!challenge.targetValue || challenge.targetValue <= 0) return 0;
    const percentage = (participant.progress / challenge.targetValue) * 100;
    return Math.min(Math.round(percentage), 100);
  }

  onChallengeClick(id: number): void {
    this.router.navigate(['/challenges', id]);
  }
}
