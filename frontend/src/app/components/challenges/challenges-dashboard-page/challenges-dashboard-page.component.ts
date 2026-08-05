import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChallengeService } from '../../../services/challenge.service';
import { Challenge, ChallengeDetail, ChallengeParticipant } from '../../../models/challenge.models';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, map, switchMap, finalize } from 'rxjs/operators';
import { AdminChallengeService } from '../../admin/challenges-new/services/admin-challenge.service';
import { CHALLENGE_TYPES } from '../../admin/challenges-new/shared/challenge-types.config';
import { CarbonCategory } from '../../../models/carbon-category.models';
import { environment } from '../../../../environments/environment';

export interface MyChallengeDisplay {
  participant: ChallengeParticipant;
  challenge: ChallengeDetail;
}

@Component({
  selector: 'app-challenges-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSkeletonComponent],
  templateUrl: './challenges-dashboard-page.component.html',
  styleUrls: ['./challenges-dashboard-page.component.css']
})
export class ChallengesDashboardPageComponent implements OnInit {
  isLoading = true;
  
  // Data segments
  myActiveChallenges: MyChallengeDisplay[] = [];
  myCompletedChallenges: MyChallengeDisplay[] = [];
  exploreChallenges: Challenge[] = [];
  recommendedChallenges: Challenge[] = [];

  // Stats
  totalXpEarned = 0;
  
  // Search and Filter
  searchQuery = '';
  activeStatusFilter = 'All';
  statuses = ['Active', 'Upcoming', 'Completed', 'Archived'];
  activeCategoryFilter = 'All';
  carbonCategories: CarbonCategory[] = [];
  challengeTypes = CHALLENGE_TYPES;
  
  Math = Math;

  constructor(
    private challengeService: ChallengeService,
    private adminChallengeService: AdminChallengeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // ForkJoin to get both my challenges and explore challenges at the same time
    forkJoin({
      my: this.challengeService.getMyChallenges(0, 100).pipe(
        switchMap(res => {
          if (res.content.length === 0) return of([]);
          return forkJoin(res.content.map(p => 
            this.challengeService.getChallengeDetail(p.challengeId).pipe(
              map(c => ({ participant: p, challenge: c } as MyChallengeDisplay)),
              catchError(() => of(null))
            )
          ));
        }),
        map(results => results.filter(r => r !== null) as MyChallengeDisplay[])
      ),
      explore: this.challengeService.getChallenges(0, 50).pipe(
        map(res => res.content)
      ),
      categories: this.adminChallengeService.getCarbonCategories().pipe(
        catchError(() => of([]))
      )
    }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        if (data.categories) {
          this.carbonCategories = data.categories;
        }
        
        const myChallenges = data.my;
        this.myActiveChallenges = myChallenges.filter(c => c.participant.status === 'ACTIVE');
        this.myCompletedChallenges = myChallenges.filter(c => c.participant.status === 'COMPLETED');
        
        // Calculate total XP
        this.totalXpEarned = this.myCompletedChallenges.reduce((sum, c) => sum + (c.challenge.rewardXp || 0), 0);
        
        // Filter out joined challenges from explore to find recommended
        const joinedIds = new Set(myChallenges.map(c => c.challenge.id));
        this.exploreChallenges = data.explore;
        
        this.recommendedChallenges = this.exploreChallenges
          .filter(c => !joinedIds.has(c.id) && c.status === 'ACTIVE')
          .slice(0, 3); // top 3 recommended
      },
      error: (err) => {
        console.error('Error loading dashboard', err);
      }
    });
  }

  get filteredExploreChallenges(): Challenge[] {
    let filtered = this.exploreChallenges;
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.description.toLowerCase().includes(q)
      );
    }
    
    if (this.activeStatusFilter !== 'All') {
      filtered = filtered.filter(c => c.status === this.activeStatusFilter.toUpperCase());
    }
    
    if (this.activeCategoryFilter !== 'All') {
      filtered = filtered.filter(c => {
        if (c.trackingMethod === 'AUTOMATIC') {
          const catName = this.getCarbonCategoryName(c.linkedCategoryId);
          return catName.toLowerCase().includes(this.activeCategoryFilter.toLowerCase());
        } else {
          return c.typeCode && c.typeCode.toLowerCase().includes(this.activeCategoryFilter.toLowerCase());
        }
      });
    }
    return filtered;
  }

  getCarbonCategoryName(id: number | null | undefined): string {
    if (!id) return 'Unknown';
    const cat = this.carbonCategories.find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
  }

  getChallengeTypeLabel(typeCode: string): string {
    return CHALLENGE_TYPES[typeCode]?.label || typeCode;
  }

  getChallengeTypeConfig(typeCode: string): any {
    return CHALLENGE_TYPES[typeCode] || CHALLENGE_TYPES['COMMUNITY'];
  }

  setStatusFilter(filter: string): void {
    this.activeStatusFilter = filter;
  }

  setCategoryFilter(filter: string): void {
    this.activeCategoryFilter = filter;
  }

  getProgressPercentage(participant: ChallengeParticipant, challenge: ChallengeDetail): number {
    if (!challenge.targetValue || challenge.targetValue <= 0) return 0;
    const percentage = (participant.progress / challenge.targetValue) * 100;
    return Math.min(Math.round(percentage), 100);
  }

  getDaysRemaining(endDate: string): number {
    if (!endDate) return 0;
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'ACTIVE': return 'bg-emerald-light text-emerald';
      case 'PENDING': return 'bg-yellow-light text-yellow-600';
      case 'COMPLETED': return 'bg-blue-light text-blue';
      case 'CLOSED': 
      case 'ARCHIVED': return 'bg-slate-200 text-slate-700';
      default: return 'bg-surface text-secondary';
    }
  }

  joinChallenge(id: number): void {
    this.challengeService.joinChallenge(id).subscribe({
      next: () => {
        // Reload dashboard to reflect joined status
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Failed to join challenge', err);
        alert('Could not join challenge. You might have already joined it.');
      }
    });
  }

  resolveImageUrl(url: string | null | undefined, fallbackIndex: number = 0): string {
    if (!url) {
      const fallbacks = [
        'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=500&q=80'
      ];
      return fallbacks[fallbackIndex % fallbacks.length];
    }
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${environment.apiUrl}/${url}`;
  }
}
