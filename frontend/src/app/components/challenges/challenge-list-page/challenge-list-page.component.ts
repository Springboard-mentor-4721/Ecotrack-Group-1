import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChallengeService } from '../../../services/challenge.service';
import { Challenge } from '../../../models/challenge.models';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { finalize } from 'rxjs/operators';

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

  constructor(private challengeService: ChallengeService) {}

  ngOnInit(): void {
    this.loadChallenges();
  }

  loadChallenges(): void {
    this.isLoading = true;
    this.challengeService.getChallenges(this.currentPage, this.pageSize)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          this.challenges = res.content || [];
          this.totalPages = res.totalPages || 0;
          this.totalElements = res.totalElements || 0;
        },
        error: (err) => console.error('Failed to load challenges', err)
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
}
