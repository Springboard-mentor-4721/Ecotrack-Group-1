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
  errorMessage = signal('');
  imgFailed = signal(false);
  showStatusConfirm = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
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
