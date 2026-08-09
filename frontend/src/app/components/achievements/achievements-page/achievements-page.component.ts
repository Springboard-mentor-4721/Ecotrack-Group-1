import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GamificationService } from '../../../services/gamification.service';
import { Badge } from '../../../models/gamification.models';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-achievements-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSkeletonComponent],
  templateUrl: './achievements-page.component.html',
  styleUrl: './achievements-page.component.css'
})
export class AchievementsPageComponent implements OnInit {
  isLoading = true;
  badges: Badge[] = [];
  
  // Filtering & Searching
  searchTerm: string = '';
  filterType: 'ALL' | 'EARNED' | 'LOCKED' | 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' = 'ALL';

  // Modal State
  selectedBadge: Badge | null = null;

  constructor(
    private gamificationService: GamificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBadges();
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

  get filteredBadges(): Badge[] {
    return this.badges.filter(badge => {
      // 1. Search term
      const matchesSearch = badge.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                            badge.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // 2. Filter type
      let matchesFilter = true;
      if (this.filterType === 'EARNED') {
        matchesFilter = badge.isEarned === true;
      } else if (this.filterType === 'LOCKED') {
        matchesFilter = badge.isEarned === false;
      } else if (['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].includes(this.filterType)) {
        matchesFilter = badge.rarity.toUpperCase() === this.filterType;
      }

      return matchesSearch && matchesFilter;
    });
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
