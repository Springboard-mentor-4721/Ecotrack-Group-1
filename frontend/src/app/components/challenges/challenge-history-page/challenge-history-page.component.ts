import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ChallengeService } from '../../../services/challenge.service';
import { MyChallengeEntry } from '../../../models/challenge.models';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, finalize } from 'rxjs/operators';
import { TERMINAL_PARTICIPANT_STATUSES } from '../shared/constants/challenge-status.constants';
import { MyChallengeCardComponent } from '../shared/components/my-challenge-card/my-challenge-card.component';
import { ChallengeHistorySummaryComponent } from './components/history-summary/challenge-history-summary.component';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-challenge-history-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MyChallengeCardComponent,
    ChallengeHistorySummaryComponent,
    LoadingSkeletonComponent
  ],
  templateUrl: './challenge-history-page.component.html',
  styleUrls: ['./challenge-history-page.component.css']
})
export class ChallengeHistoryPageComponent implements OnInit {
  isLoading = signal(true);
  historyEntries = signal<MyChallengeEntry[]>([]);
  
  // Tab State
  activeTab = signal<'all' | 'completed' | 'failed'>('all');

  // Summary Stats
  totalCompleted = signal(0);
  totalXpEarned = signal(0);
  totalFailed = signal(0);

  constructor(
    private challengeService: ChallengeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading.set(true);
    
    // N+1 Fetch Strategy with limit of 100
    this.challengeService.getMyChallenges(0, 100).pipe(
      switchMap(res => {
        if (!res?.content || res.content.length === 0) return of([]);
        
        // Filter strictly for terminal statuses
        const terminalParticipations = res.content.filter(p => 
          TERMINAL_PARTICIPANT_STATUSES.includes(p.status)
        );
        
        if (terminalParticipations.length === 0) return of([]);
        
        // Hydrate with ChallengeDetail
        return forkJoin(terminalParticipations.map(p => 
          this.challengeService.getChallengeDetail(p.challengeId).pipe(
            map(c => c ? ({ participant: p, challenge: c } as MyChallengeEntry) : null),
            catchError(() => of(null))
          )
        ));
      }),
      map(results => results.filter(r => r !== null) as MyChallengeEntry[]),
      finalize(() => {
        this.isLoading.set(false);
        })
    ).subscribe({
      next: (entries) => {
        // Sort by completedAt descending
        this.historyEntries.set(entries.sort((a, b) => {
          const dateA = new Date(a.participant.completedAt || a.challenge.endDate || 0).getTime();
          const dateB = new Date(b.participant.completedAt || b.challenge.endDate || 0).getTime();
          return dateB - dateA;
        }));
        
        this.calculateStats();
      },
      error: (err) => {
        console.error('Error loading history:', err);
      }
    });
  }

  calculateStats(): void {
    this.totalCompleted.set(this.historyEntries().filter(e => e.participant.status === 'COMPLETED').length);
    this.totalFailed.set(this.historyEntries().filter(e => e.participant.status === 'FAILED' || e.participant.status === 'DROPPED').length);
    
    this.totalXpEarned.set(this.historyEntries()
      .filter(e => e.participant.status === 'COMPLETED')
      .reduce((sum, e) => sum + (e.challenge.rewardXp || 0), 0));
  }

  setTab(tab: 'all' | 'completed' | 'failed'): void {
    this.activeTab.set(tab);
  }

  filteredEntries = computed(() => { if (this.activeTab() === 'all') { return this.historyEntries(); } else if (this.activeTab() === 'completed') { return this.historyEntries().filter(e => e.participant.status === 'COMPLETED'); } else { return this.historyEntries().filter(e => e.participant.status === 'FAILED' || e.participant.status === 'DROPPED'); } });

  viewChallenge(id: number): void {
    this.router.navigate(['/challenges', id]);
  }
}
