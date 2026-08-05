import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChallengeService } from '../../../services/challenge.service';
import { Challenge } from '../../../models/challenge.models';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-challenge-list-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSkeletonComponent],
  templateUrl: './challenge-list-page.component.html',
  styleUrl: './challenge-list-page.component.css'
})
export class ChallengeListPageComponent implements OnInit {
  isLoading = true;
  challenges: Challenge[] = [];
  
  // Pagination
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;

  constructor(
    private challengeService: ChallengeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadChallenges();
  }

  loadChallenges(): void {
    this.isLoading = true;
    this.challengeService.getChallenges(this.currentPage, this.pageSize)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.challenges = res.content || [];
          this.totalPages = res.totalPages || 0;
          this.totalElements = res.totalElements || 0;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load challenges', err);
          this.cdr.detectChanges();
        }
      });
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadChallenges();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadChallenges();
    }
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

  getDaysRemaining(endDate: string): number {
    if (!endDate) return 0;
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
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
