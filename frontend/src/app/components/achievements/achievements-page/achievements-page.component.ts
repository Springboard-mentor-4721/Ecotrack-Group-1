import { Component, OnInit } from '@angular/core';
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
  filterType: 'ALL' | 'EARNED' | 'LOCKED' = 'ALL';

  constructor(private gamificationService: GamificationService) {}

  ngOnInit(): void {
    this.loadBadges();
  }

  loadBadges(): void {
    this.isLoading = true;
    this.gamificationService.getBadges()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.badges = data;
        },
        error: (err) => console.error('Error fetching badges', err)
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
      }

      return matchesSearch && matchesFilter;
    });
  }

  getXpReward(rarity: string): number {
    switch(rarity.toUpperCase()) {
      case 'BRONZE': return 100;
      case 'SILVER': return 250;
      case 'GOLD': return 500;
      case 'PLATINUM': return 1000;
      default: return 50;
    }
  }

  getBadgeIconClass(rarity: string, isEarned: boolean): string {
    if (!isEarned) return 'bg-light text-secondary opacity-50';
    switch (rarity.toUpperCase()) {
      case 'BRONZE': return 'bg-orange-light text-orange';
      case 'SILVER': return 'bg-slate-200 text-slate-700';
      case 'GOLD': return 'bg-yellow-light text-yellow-600';
      case 'PLATINUM': return 'bg-cyan-light text-cyan-600';
      default: return 'bg-emerald-light text-emerald';
    }
  }
}
