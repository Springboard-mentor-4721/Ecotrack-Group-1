import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { UserSummaryResponse } from '../../../models/admin.models';
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
export class AdminUsersListComponent implements OnInit {
  users = signal<(UserSummaryResponse & { _imgFailed?: boolean })[]>([]);
  searchQuery = signal('');
  
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);
  totalElements = signal(0);
  
  showStatusConfirm = signal(false);
  userToUpdate = signal<(UserSummaryResponse & { _imgFailed?: boolean }) | null>(null);
  
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
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
  }

  cancelStatusToggle(): void {
    this.showStatusConfirm.set(false);
    this.userToUpdate.set(null);
  }

  confirmToggleStatus(): void {
    if (!this.userToUpdate()) return;
    
    const newStatus = this.userToUpdate()!.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    this.adminService.updateUserStatus(this.userToUpdate()!.id, newStatus).subscribe({
      next: () => {
        this.showStatusConfirm.set(false);
        this.userToUpdate.set(null);
        this.loadUsers();
      },
      error: (err) => {
        console.error('Failed to update status', err);
        this.errorMessage.set(err.error?.message || 'Failed to update user status');
        this.showStatusConfirm.set(false);
        this.userToUpdate.set(null);
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
}
