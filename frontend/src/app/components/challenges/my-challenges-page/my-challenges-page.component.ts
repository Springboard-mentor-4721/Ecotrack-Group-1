import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChallengeService } from '../../../services/challenge.service';
import { ChallengeDetail, ChallengeParticipant } from '../../../models/challenge.models';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, finalize } from 'rxjs/operators';
import { LucideAngularModule, Target, Calendar, Activity, CheckCircle, Clock } from 'lucide-angular';

export interface MyChallengeDisplay {
  participant: ChallengeParticipant;
  challenge: ChallengeDetail;
}

@Component({
  selector: 'app-my-challenges-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './my-challenges-page.component.html',
  styleUrls: ['./my-challenges-page.component.css']
})
export class MyChallengesPageComponent implements OnInit {
  myChallenges: MyChallengeDisplay[] = [];
  isLoading = false;
  errorMessage = '';

  // Pagination
  currentPage = 0;
  pageSize = 9;
  totalPages = 0;
  totalElements = 0;

  // Icons
  TargetIcon = Target;
  CalendarIcon = Calendar;
  ActivityIcon = Activity;
  CheckCircleIcon = CheckCircle;
  ClockIcon = Clock;

  constructor(
    private challengeService: ChallengeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMyChallenges(this.currentPage);
  }

  loadMyChallenges(page: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.challengeService.getMyChallenges(page, this.pageSize)
      .pipe(
        switchMap(response => {
          this.currentPage = response.number;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;

          const participants = response.content;
          
          if (participants.length === 0) {
            return of([]);
          }

          const challengeRequests = participants.map(participant => 
            this.challengeService.getChallengeDetail(participant.challengeId).pipe(
              map(challenge => ({ participant, challenge } as MyChallengeDisplay)),
              catchError(error => {
                console.error(`Error loading challenge detail for ID ${participant.challengeId}`, error);
                // Return null on error, filter out later
                return of(null);
              })
            )
          );

          return forkJoin(challengeRequests);
        }),
        map(results => results.filter(res => res !== null) as MyChallengeDisplay[]),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (displays) => {
          this.myChallenges = displays;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = 'Failed to load your challenges. Please try again later.';
          console.error('Error fetching my challenges', err);
          this.cdr.detectChanges();
        }
      });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.loadMyChallenges(newPage);
    }
  }

  getProgressPercentage(participant: ChallengeParticipant, challenge: ChallengeDetail): number {
    if (!challenge.targetValue || challenge.targetValue <= 0) return 0;
    const percentage = (participant.progress / challenge.targetValue) * 100;
    return Math.min(Math.round(percentage), 100);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-light text-emerald';
      case 'COMPLETED': return 'bg-blue-light text-blue';
      case 'DROPPED': return 'bg-danger bg-opacity-10 text-danger';
      default: return 'bg-surface text-secondary';
    }
  }
}
