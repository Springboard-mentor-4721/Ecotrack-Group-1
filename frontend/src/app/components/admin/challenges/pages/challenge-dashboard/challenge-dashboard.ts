import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { AdminService } from '../../../../../services/admin.service';
import { Challenge } from '../../../../../models/challenge.models';
import { 
  LucideAngularModule, 
  Flag, PlayCircle, CalendarDays, CheckCircle, Archive, 
  Users, Target, Leaf, Star, Search, Bell, Plus, TrendingUp 
} from 'lucide-angular';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-challenge-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, LucideAngularModule],
  templateUrl: './challenge-dashboard.html',
  styleUrl: './challenge-dashboard.css'
})
export class ChallengeDashboard implements OnInit {
  readonly icons = { 
    Flag, PlayCircle, CalendarDays, CheckCircle, Archive, 
    Users, Target, Leaf, Star, Search, Bell, Plus, TrendingUp 
  };

  challenges: Challenge[] = [];
  recentChallenges: Challenge[] = [];
  upcomingChallenges: Challenge[] = [];
  isLoading = false;
  
  // Analytics Top Row
  totalChallenges = 0;
  activeCount = 0;
  scheduledCount = 0;
  completedCount = 0;
  archivedCount = 0;

  // Analytics Second Row
  totalParticipants = 0;
  avgCompletionRate = 0;
  communityImpact = 0;
  xpAwarded = 0;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadChallenges();
  }

  loadChallenges(): void {
    this.isLoading = true;
    this.adminService.getAdminChallenges(0, 50)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response: any) => {
          this.challenges = response.content || [];
          
          this.totalChallenges = this.challenges.length;
          this.activeCount = this.challenges.filter(c => c.status === 'ACTIVE').length;
          this.scheduledCount = this.challenges.filter(c => c.status === 'PENDING' || c.status === 'CLOSED').length;
          this.completedCount = this.challenges.filter(c => c.status === 'COMPLETED').length;
          this.archivedCount = this.challenges.filter(c => c.status === 'ARCHIVED').length;
          
          // Basic analytics (mocking completion rate since it\'s not in the base model)
          this.totalParticipants = this.challenges.reduce((sum, c) => sum + ((c as any).participantCount || 0), 0) || 2540;
          this.avgCompletionRate = this.challenges.length > 0 ? 68 : 0; 
          this.communityImpact = 18.7; // mock t CO2e
          this.xpAwarded = 125830; // mock XP
          
          // Split recent vs upcoming
          this.recentChallenges = this.challenges.filter(c => c.status === 'ACTIVE' || c.status === 'COMPLETED').slice(0, 3);
          this.upcomingChallenges = this.challenges.filter(c => c.status === 'PENDING' || c.status === 'CLOSED').slice(0, 3);

          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Failed to load challenges', err);
          this.cdr.detectChanges();
        }
      });
  }

  onEditChallenge(challenge: Challenge): void {
    this.router.navigate(['/admin/challenges-new/create'], { queryParams: { id: challenge.id } });
  }
}
