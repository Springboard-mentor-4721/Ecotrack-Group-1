import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { UserDetailResponse } from '../../../models/admin.models';
import { finalize } from 'rxjs/operators';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-user-details',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSkeletonComponent],
  templateUrl: './user-details.html',
  styleUrls: ['./user-details.css']
})
export class AdminUserDetailsComponent implements OnInit {
  user: UserDetailResponse | null = null;
  isLoading = true;
  errorMessage = '';
  imgFailed = false;
  showStatusConfirm = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadUserDetails(+idParam);
    } else {
      this.router.navigate(['/admin/users']);
    }
  }

  loadUserDetails(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminService.getUserById(id)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.user = data;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load user details.';
        }
      });
  }

  initiateToggleStatus(): void {
    this.showStatusConfirm = true;
  }

  cancelStatusToggle(): void {
    this.showStatusConfirm = false;
  }

  confirmToggleStatus(): void {
    if (!this.user) return;
    
    const newStatus = this.user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    
    this.adminService.updateUserStatus(this.user.id, newStatus)
      .pipe(finalize(() => {
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.errorMessage = '';
          this.showStatusConfirm = false;
          this.loadUserDetails(this.user!.id);
        },
        error: (err) => {
          this.showStatusConfirm = false;
          this.errorMessage = err.error?.message || 'Failed to update user status.';
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
