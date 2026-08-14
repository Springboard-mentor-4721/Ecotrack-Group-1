import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GamificationService } from '../../../services/gamification.service';
import { Badge } from '../../../models/gamification.models';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { finalize } from 'rxjs/operators';
import { GoalService } from '../../../services/goal.service';
import { GoalResponse, GoalAnalyticsResponse } from '../../../models/goal.models';
import { ActivatedRoute } from '@angular/router';
import { BadgeEmblemComponent } from '../../../shared/components/badge-emblem/badge-emblem.component';

@Component({
  selector: 'app-achievements-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSkeletonComponent, BadgeEmblemComponent],
  templateUrl: './achievements-page.component.html',
  styleUrl: './achievements-page.component.css'
})
export class AchievementsPageComponent implements OnInit {
  isLoading = true;
  badges: Badge[] = [];
  
  // Goals State
  isGoalsLoading = false;
  goalsFetched = false;
  goalAchievements: GoalResponse[] = [];
  achievementAnalyticsMap: { [id: number]: GoalAnalyticsResponse } = {};
  goalXpMap: { [id: number]: number } = {};
  expandedAchievementId: number | null = null;
  achievementsPage = 0;
  achievementsPageSize = 5;
  
  // Navigation & Filtering
  primaryCategory: 'GENERAL' | 'CHALLENGE' | 'GOAL' = 'GENERAL';
  searchTerm: string = '';
  filterType: 'ALL' | 'EARNED' | 'LOCKED' | 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' = 'ALL';

  // Modal State
  selectedBadge: Badge | null = null;

  constructor(
    private gamificationService: GamificationService,
    private goalService: GoalService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadBadges();
    
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'GOAL') {
        this.setPrimaryCategory('GOAL');
      }
    });
  }

  loadBadges(): void {
    this.isLoading = true;
    this.gamificationService.getBadges()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.badges = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching badges', err);
          this.cdr.detectChanges();
        }
      });
  }

  loadGoalsIfNecessary(): void {
    if (this.goalsFetched) return;
    this.isGoalsLoading = true;
    this.goalService.getGoals().subscribe({
      next: (goals) => {
        this.goalsFetched = true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.goalAchievements = goals.content.filter(g => {
          if (!g.isAutomatic) {
            return (g.status as string) === 'ACHIEVED' || (g.status as string) === 'COMPLETED';
          } else {
            const targetDate = new Date(g.targetDate);
            targetDate.setHours(23, 59, 59, 999);
            return targetDate < today && g.currentValue <= g.targetValue;
          }
        });

        if (this.goalAchievements.length === 0) {
          this.isGoalsLoading = false;
          this.cdr.detectChanges();
          return;
        }

        let loaded = 0;
        this.goalAchievements.forEach(goal => {
          this.goalService.getAnalytics(goal.id).subscribe({
            next: (data) => {
              this.achievementAnalyticsMap[goal.id] = data;
              loaded++;
              this.checkGoalsLoaded(loaded);
            },
            error: () => {
              loaded++;
              this.checkGoalsLoaded(loaded);
            }
          });
        });

        // Also fetch XP history to get actual XP awarded for goals
        this.gamificationService.getXpHistory(0, 1000).subscribe({
          next: (xpData) => {
            if (xpData && xpData.content) {
              xpData.content.forEach(entry => {
                if (entry.sourceType === 'GOAL_COMPLETED') {
                  this.goalXpMap[entry.sourceId] = entry.xpAwarded;
                }
              });
            }
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error fetching goals', err);
        this.isGoalsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private checkGoalsLoaded(loaded: number): void {
    if (loaded >= this.goalAchievements.length) {
      this.isGoalsLoading = false;
      this.cdr.detectChanges();
    }
  }

  get achievementsPageStart(): number {
    return this.achievementsPage * this.achievementsPageSize;
  }

  get achievementsPageEnd(): number {
    return Math.min(this.achievementsPageStart + this.achievementsPageSize, this.goalAchievements.length);
  }

  get paginatedGoalAchievements(): GoalResponse[] {
    return this.goalAchievements.slice(this.achievementsPageStart, this.achievementsPageEnd);
  }

  toggleAchievementHistory(goalId: number): void {
    this.expandedAchievementId = this.expandedAchievementId === goalId ? null : goalId;
  }

  getAchievementLabel(goal: GoalResponse): string {
    if (!goal.isAutomatic) return 'Completed';
    return 'Budget Completed';
  }

  getProgressPercentage(current: number, target: number): number {
    if (!target || target === 0) return 0;
    const pct = (current / target) * 100;
    return Math.min(Math.round(pct), 100);
  }

  getAchievementBadgeClass(goal: GoalResponse): string {
    if (!goal.isAutomatic) {
      return 'bg-success-subtle text-success border-success-subtle';
    }
    const pct = this.getProgressPercentage(goal.currentValue, goal.targetValue);
    if (pct <= 50) return 'bg-success-subtle text-success border-success-subtle';
    if (pct <= 75) return 'bg-primary-subtle text-primary border-primary-subtle';
    return 'bg-warning-subtle text-warning border-warning-subtle';
  }

  getGoalCategory(type: string): string {
    const categories: Record<string, string> = {
      'ENERGY': 'Energy Goal',
      'TRANSPORT': 'Transportation Goal',
      'DIET': 'Diet Goal',
      'WASTE': 'Waste Reduction Goal'
    };
    return categories[type] || 'General Goal';
  }

  getManualAchievementsCount(): number {
    return this.goalAchievements.filter(g => !g.isAutomatic).length;
  }

  getAutoAchievementsCount(): number {
    return this.goalAchievements.filter(g => g.isAutomatic).length;
  }

  get filteredBadges(): Badge[] {
    return this.badges.filter(badge => {
      // 1. Primary Category
      let matchesCategory = false;
      const isChallengeBadge = badge.type === 'CHALLENGE';

      if (this.primaryCategory === 'CHALLENGE') {
        matchesCategory = isChallengeBadge;
      } else if (this.primaryCategory === 'GENERAL') {
        // GENERAL
        matchesCategory = !isChallengeBadge;
      } else {
        // GOAL tab doesn't use badges
        matchesCategory = false;
      }

      if (!matchesCategory) return false;

      // 2. Search term
      const matchesSearch = badge.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                            badge.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      
      // 3. Secondary filter type
      let matchesFilter = true;
      if (this.filterType === 'EARNED') {
        matchesFilter = badge.isEarned === true;
      } else if (this.filterType === 'LOCKED') {
        matchesFilter = badge.isEarned === false;
      } else if (['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].includes(this.filterType)) {
        matchesFilter = badge.rarity?.toUpperCase() === this.filterType;
      }

      return matchesFilter;
    }).sort((a, b) => {
      if (a.isEarned === b.isEarned) return 0;
      return a.isEarned ? -1 : 1;
    });
  }

  setPrimaryCategory(category: 'GENERAL' | 'CHALLENGE' | 'GOAL'): void {
    this.primaryCategory = category;
    this.filterType = 'ALL';
    if (category === 'GOAL') {
      this.loadGoalsIfNecessary();
    }
  }

  openBadgeModal(badge: Badge): void {
    this.selectedBadge = badge;
  }

  closeBadgeModal(): void {
    this.selectedBadge = null;
  }

  getBadgeIconClass(rarity: string, isEarned: boolean): string {
    if (!isEarned) return 'bg-light text-secondary opacity-50';
    switch (rarity.toUpperCase()) {
      case 'COMMON': return 'bg-orange-light text-orange';
      case 'RARE': return 'bg-slate-200 text-slate-700';
      case 'EPIC': return 'bg-yellow-light text-yellow-600';
      case 'LEGENDARY': return 'bg-cyan-light text-cyan-600';
      default: return 'bg-emerald-light text-emerald';
    }
  }

  getBadgeProgressPercent(badge: Badge): number {
    if (!badge.currentValue || !badge.criteriaThreshold || badge.criteriaThreshold === 0) return 0;
    if (badge.isEarned) return 100;
    const progress = (badge.currentValue / badge.criteriaThreshold) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }
}
