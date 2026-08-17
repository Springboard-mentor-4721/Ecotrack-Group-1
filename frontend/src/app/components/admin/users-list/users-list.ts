import { Component, OnInit, OnDestroy, signal, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { UserSummaryResponse, AdminDashboardResponse } from '../../../models/admin.models';
import { finalize } from 'rxjs/operators';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-users-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSkeletonComponent],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.css']
})
export class AdminUsersListComponent implements OnInit, OnDestroy {
  users = signal<(UserSummaryResponse & { _imgFailed?: boolean })[]>([]);
  searchQuery = signal('');
  
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);
  totalElements = signal(0);
  
  showStatusConfirm = signal(false);
  userToUpdate = signal<(UserSummaryResponse & { _imgFailed?: boolean }) | null>(null);
  
  dashboardSummary = signal<AdminDashboardResponse | null>(null);
  openDropdownId = signal<number | null>(null);
  
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private adminService: AdminService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadDashboardSummary();
  }

  ngOnDestroy(): void {
    this.document.body.style.overflow = '';
  }

  loadDashboardSummary(): void {
    this.adminService.getDashboardSummary().subscribe({
      next: (summary) => this.dashboardSummary.set(summary),
      error: (err) => console.error('Failed to load dashboard summary', err)
    });
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.adminService.getUsers(this.currentPage(), this.pageSize(), this.searchQuery())
      .pipe(finalize(() => {
        this.isLoading.set(false);
      }))
      .subscribe({
        next: (response) => {
          this.users.set(response.content);
          this.totalPages.set(response.totalPages);
          this.totalElements.set(response.totalElements);
        },
        error: (err) => {
          console.error('Failed to load users', err);
        }
      });
  }

  onSearch(): void {
    this.currentPage.set(0);
    this.loadUsers();
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadUsers();
    }
  }

  initiateToggleStatus(user: any): void {
    this.userToUpdate.set(user);
    this.showStatusConfirm.set(true);
    this.document.body.style.overflow = 'hidden';
  }

  cancelStatusToggle(): void {
    this.showStatusConfirm.set(false);
    this.userToUpdate.set(null);
    this.document.body.style.overflow = '';
  }

  confirmToggleStatus(): void {
    if (!this.userToUpdate()) return;
    
    const newStatus = this.userToUpdate()!.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    this.adminService.updateUserStatus(this.userToUpdate()!.id, newStatus).subscribe({
      next: () => {
        this.showStatusConfirm.set(false);
        this.userToUpdate.set(null);
        this.document.body.style.overflow = '';
        this.loadUsers();
      },
      error: (err) => {
        console.error('Failed to update status', err);
        this.errorMessage.set(err.error?.message || 'Failed to update user status');
        this.showStatusConfirm.set(false);
        this.userToUpdate.set(null);
        this.document.body.style.overflow = '';
        setTimeout(() => this.errorMessage.set(''), 5000);
      }
    });
  }

  showRoleConfirm = signal(false);
  roleToUpdate = signal<(UserSummaryResponse & { _imgFailed?: boolean }) | null>(null);

  initiateToggleRole(user: any): void {
    this.roleToUpdate.set(user);
    this.showRoleConfirm.set(true);
    this.document.body.style.overflow = 'hidden';
  }

  cancelRoleToggle(): void {
    this.showRoleConfirm.set(false);
    this.roleToUpdate.set(null);
    this.document.body.style.overflow = '';
  }

  confirmToggleRole(): void {
    if (!this.roleToUpdate()) return;
    
    const newRole = this.roleToUpdate()!.role === 'ADMIN' ? 'USER' : 'ADMIN';
    this.adminService.updateUserRole(this.roleToUpdate()!.id, newRole).subscribe({
      next: () => {
        this.showRoleConfirm.set(false);
        this.roleToUpdate.set(null);
        this.document.body.style.overflow = '';
        this.loadUsers();
      },
      error: (err) => {
        console.error('Failed to update role', err);
        this.errorMessage.set(err.error?.message || 'Failed to update user role');
        this.showRoleConfirm.set(false);
        this.roleToUpdate.set(null);
        this.document.body.style.overflow = '';
        setTimeout(() => this.errorMessage.set(''), 5000);
      }
    });
  }

  resolveImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const base = environment.apiUrl || 'http://localhost:8080';
    return `${base}/${url.replace(/^\//, '')}`;
  }

  toggleDropdown(userId: number, event: Event): void {
    event.stopPropagation();
    if (this.openDropdownId() === userId) {
      this.openDropdownId.set(null);
    } else {
      this.openDropdownId.set(userId);
    }
  }

  closeDropdown(): void {
    this.openDropdownId.set(null);
  }
}
