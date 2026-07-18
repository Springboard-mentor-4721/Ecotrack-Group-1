import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { UserSummaryResponse } from '../../../models/admin.models';
import { finalize } from 'rxjs/operators';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-admin-users-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSkeletonComponent],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.css']
})
export class AdminUsersListComponent implements OnInit {
  users: UserSummaryResponse[] = [];
  searchQuery = '';
  
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  
  isLoading = false;
  errorMessage = '';

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getUsers(this.currentPage, this.pageSize, this.searchQuery)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          this.users = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
        },
        error: (err) => {
          console.error('Failed to load users', err);
        }
      });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  toggleStatus(user: any): void {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    this.adminService.updateUserStatus(user.id, newStatus).subscribe({
      next: () => this.loadUsers(),
      error: (err) => {
        console.error('Failed to update status', err);
        this.errorMessage = err.error?.message || 'Failed to update user status';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }
}
