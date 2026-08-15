import { Component, OnInit, signal, computed } from '@angular/core';
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
  isLoading = signal(true);
  badges = signal<Badge[]>([]);

  // Goals State
  isGoalsLoading = signal(false);
  goalsFetched = signal(false);
  goalAchievements = signal<GoalResponse[]>([]);
  achievementAnalyticsMap = signal<{ [id: number]: GoalAnalyticsResponse }>({});
  goalXpMap = signal<{ [id: number]: number }>({});
  expandedAchievementId = signal<number | null>(null);
  achievementsPage = signal(0);
  achievementsPageSize = signal(5);

  // Navigation & Filtering
  primaryCategory = signal<'GENERAL' | 'CHALLENGE' | 'GOAL'>('GENERAL');
  searchTerm = signal('');
  filterType = signal<'ALL' | 'EARNED' | 'LOCKED' | 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'>('ALL');

  // Modal State
  selectedBadge = signal<Badge | null>(null);

  constructor(
    private gamificationService: GamificationService,
    private goalService: GoalService,
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
    this.isLoading.set(true);
    this.gamificationService.getBadges()
      .pipe(finalize(() => {
        this.isLoading.set(false);
      }))
      .subscribe({
        next: (data) => {
          this.badges.set(data);
        },
        error: (err) => {
          console.error('Error fetching badges', err);
        }
      });
  }

  loadGoalsIfNecessary(): void {
    if (this.goalsFetched()) return;
    this.isGoalsLoading.set(true);
    this.goalService.getGoals().subscribe({
      next: (goals) => {
        this.goalsFetched.set(true);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.goalAchievements.set(goals.content.filter(g => {
          if (!g.isAutomatic) {
            return (g.status as string) === 'ACHIEVED' || (g.status as string) === 'COMPLETED';
          } else {
            const targetDate = new Date(g.targetDate);
            targetDate.setHours(23, 59, 59, 999);
            return targetDate < today && g.currentValue <= g.targetValue;
          }
        }));

        if (this.goalAchievements().length === 0) {
          this.isGoalsLoading.set(false);
          return;
        }

        let loaded = 0;
        this.goalAchievements().forEach(goal => {
          this.goalService.getAnalytics(goal.id).subscribe({
            next: (data) => {
              this.achievementAnalyticsMap.update(map => ({...map, [goal.id]: data}));
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
                  this.goalXpMap.update(map => ({...map, [entry.sourceId]: entry.xpAwarded}));
                }
              });
            }
          }
        });
      },
      error: (err) => {
        console.error('Error fetching goals', err);
        this.isGoalsLoading.set(false);
      }
    });
  }

  private checkGoalsLoaded(loaded: number): void {
    if (loaded >= this.goalAchievements().length) {
      this.isGoalsLoading.set(false);
    }
  }

  achievementsPageStart = computed(() => {
    return this.achievementsPage() * this.achievementsPageSize();
  });

  achievementsPageEnd = computed(() => {
    return Math.min(this.achievementsPageStart() + this.achievementsPageSize(), this.goalAchievements().length);
  });

  paginatedGoalAchievements = computed(() => {
    return this.goalAchievements().slice(this.achievementsPageStart(), this.achievementsPageEnd());
  });

  toggleAchievementHistory(goalId: number): void {
    this.expandedAchievementId.update(id => id === goalId ? null : goalId);
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
    return this.goalAchievements().filter(g => !g.isAutomatic).length;
  }

  getAutoAchievementsCount(): number {
    return this.goalAchievements().filter(g => g.isAutomatic).length;
  }

  filteredBadges = computed(() => {
    return this.badges().filter(badge => {
      // 1. Primary Category
      let matchesCategory = false;
      const isChallengeBadge = badge.type === 'CHALLENGE';

      if (this.primaryCategory() === 'CHALLENGE') {
        matchesCategory = isChallengeBadge;
      } else if (this.primaryCategory() === 'GENERAL') {
        // GENERAL
        matchesCategory = !isChallengeBadge;
      } else {
        // GOAL tab doesn't use badges
        matchesCategory = false;
      }

      if (!matchesCategory) return false;

      // 2. Search term
      const matchesSearch = badge.name.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
                            badge.description.toLowerCase().includes(this.searchTerm().toLowerCase());
      if (!matchesSearch) return false;

      // 3. Secondary filter type
      let matchesFilter = true;
      if (this.filterType() === 'EARNED') {
        matchesFilter = badge.isEarned === true;
      } else if (this.filterType() === 'LOCKED') {
        matchesFilter = badge.isEarned === false;
      } else if (['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].includes(this.filterType())) {
        matchesFilter = badge.rarity?.toUpperCase() === this.filterType();
      }

      return matchesFilter;
    }).sort((a, b) => {
      if (a.isEarned === b.isEarned) return 0;
      return a.isEarned ? -1 : 1;
    });
  });

  setPrimaryCategory(category: 'GENERAL' | 'CHALLENGE' | 'GOAL'): void {
    this.primaryCategory.set(category);
    this.filterType.set('ALL');
    if (category === 'GOAL') {
      this.loadGoalsIfNecessary();
    }
  }

  openBadgeModal(badge: Badge): void {
    this.selectedBadge.set(badge);
  }

  closeBadgeModal(): void {
    this.selectedBadge.set(null);
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
