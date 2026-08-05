import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChallengeService } from '../../../services/challenge.service';
import { AuthService } from '../../../services/auth.service';
import { ChallengeDetail } from '../../../models/challenge.models';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-challenge-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './challenge-detail-page.component.html',
  styleUrl: './challenge-detail-page.component.css'
})
export class ChallengeDetailPageComponent implements OnInit {
  isLoading = true;
  isActionLoading = false;
  challenge: ChallengeDetail | null = null;
  relatedChallenges: any[] = [];
  error = false;
  
  // Custom Progress Input
  showProgressModal = false;
  customAmount: number | null = null;
  isAdminUser = false;

  constructor(
    private route: ActivatedRoute,
    private challengeService: ChallengeService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isAdminUser = this.authService.isAdmin();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadChallenge(Number(id));
    } else {
      this.error = true;
      this.isLoading = false;
    }
  }

  loadChallenge(id: number): void {
    this.isLoading = true;
    this.error = false;
    this.challengeService.getChallengeDetail(id)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.challenge = res;
          // Load related
          this.challengeService.getChallenges(0, 5).subscribe({
            next: (listRes) => {
              this.relatedChallenges = listRes.content.filter(c => c.id !== res.id).slice(0, 3);
              this.cdr.detectChanges();
            }
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load challenge detail', err);
          this.error = true;
          this.cdr.detectChanges();
        }
      });
  }

  joinChallenge(): void {
    if (!this.challenge) return;
    this.isActionLoading = true;
    this.challengeService.joinChallenge(this.challenge.id)
      .pipe(finalize(() => {
        this.isActionLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (participant) => {
          if (this.challenge) {
            this.challenge.userProgress = participant;
            this.challenge.participantCount++;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to join challenge', err);
          this.cdr.detectChanges();
        }
      });
  }

  openProgressModal(): void {
    if (!this.challenge || !this.challenge.userProgress) return;
    this.customAmount = null;
    this.showProgressModal = true;
  }

  submitQuickCount(amount: number): void {
    this.submitProgress(amount);
  }

  closeProgressModal(): void {
    this.showProgressModal = false;
  }

  submitCustomProgress(): void {
    if (this.customAmount && this.customAmount > 0) {
      this.submitProgress(this.customAmount);
      this.closeProgressModal();
    }
  }

  private submitProgress(amount: number): void {
    if (!this.challenge || !this.challenge.userProgress) return;
    this.isActionLoading = true;
    this.challengeService.updateProgress(this.challenge.id, amount)
      .pipe(finalize(() => {
        this.isActionLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (participant) => {
          if (this.challenge) {
            this.challenge.userProgress = participant;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to update progress', err);
          this.cdr.detectChanges();
        }
      });
  }

  get communityProgressPercentage(): number {
    if (!this.challenge) return 0;
    const p = ((this.challenge.communityProgress || 0) / this.challenge.targetValue) * 100;
    return Math.min(Math.max(p, 0), 100);
  }

  get progressPercentage(): number {
    if (!this.challenge || !this.challenge.userProgress) return 0;
    const p = (this.challenge.userProgress.progress / this.challenge.targetValue) * 100;
    return Math.min(Math.max(p, 0), 100);
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

  getDaysRemaining(): number {
    if (!this.challenge || !this.challenge.endDate) return 0;
    const end = new Date(this.challenge.endDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  }

  Math = Math;

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
