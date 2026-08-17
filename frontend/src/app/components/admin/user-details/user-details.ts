import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { UserDetailResponse } from '../../../models/admin.models';
import { finalize } from 'rxjs/operators';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-user-details',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSkeletonComponent],
  templateUrl: './user-details.html',
  styleUrls: ['./user-details.css']
})
export class AdminUserDetailsComponent implements OnInit {
  user = signal<UserDetailResponse | null>(null);
  isLoading = signal(true);
  isChallengesLoading = signal(false);
  errorMessage = signal('');
  challengesErrorMessage = signal('');
  imgFailed = signal(false);
  showStatusConfirm = signal(false);
  
  challengeHistory = signal<any[]>([]);
  challengesTotalElements = signal(0);
  challengesTotalPages = signal(0);
  challengesCurrentPage = signal(0);
  challengesPageSize = 5;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadUserDetails(+idParam);
      this.loadChallengeHistory(+idParam, 0);
    } else {
      this.router.navigate(['/admin/users']);
    }
  }

  loadUserDetails(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.adminService.getUserById(id)
      .pipe(finalize(() => {
        this.isLoading.set(false);
      }))
      .subscribe({
        next: (data) => {
          this.user.set(data);
        },
        error: (err) => {
          this.errorMessage.set('Failed to load user details.');
        }
      });
  }

  loadChallengeHistory(userId: number, page: number): void {
    this.isChallengesLoading.set(true);
    this.challengesErrorMessage.set('');
    this.adminService.getUserChallengeHistory(userId, page, this.challengesPageSize)
      .pipe(finalize(() => this.isChallengesLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.challengeHistory.set(data.content);
          this.challengesTotalElements.set(data.totalElements);
          this.challengesTotalPages.set(data.totalPages);
          this.challengesCurrentPage.set(data.number);
        },
        error: (err) => {
          this.challengesErrorMessage.set('Failed to load challenge history.');
        }
      });
  }

  changeChallengePage(newPage: number): void {
    const currentUser = this.user();
    if (currentUser && newPage >= 0 && newPage < this.challengesTotalPages()) {
      this.loadChallengeHistory(currentUser.id, newPage);
    }
  }

  initiateToggleStatus(): void {
    this.showStatusConfirm.set(true);
  }

  cancelStatusToggle(): void {
    this.showStatusConfirm.set(false);
  }

  confirmToggleStatus(): void {
    const currentUser = this.user();
    if (!currentUser) return;
    
    const newStatus = currentUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    
    this.adminService.updateUserStatus(currentUser.id, newStatus)
      .pipe(finalize(() => {}))
      .subscribe({
        next: () => {
          this.errorMessage.set('');
          this.showStatusConfirm.set(false);
          this.loadUserDetails(currentUser.id);
        },
        error: (err) => {
          this.showStatusConfirm.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to update user status.');
        }
      });
  }

  resolveImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const base = environment.apiUrl || 'http://localhost:8080';
    return `${base}/${url.replace(/^\//, '')}`;
  }
}
