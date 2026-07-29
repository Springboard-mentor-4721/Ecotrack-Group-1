import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../../services/admin.service';
import { Challenge, ChallengeRequest } from '../../../../models/challenge.models';
import { finalize } from 'rxjs/operators';
import { LucideAngularModule, Edit, Play, Pause, Trash2, Plus, Calendar, Target, List, X } from 'lucide-angular';

declare var bootstrap: any;

@Component({
  selector: 'app-admin-challenge-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  providers: [DatePipe],
  templateUrl: './admin-challenge-list.component.html',
  styleUrls: ['./admin-challenge-list.component.css']
})
export class AdminChallengeListComponent implements OnInit {
  challenges: Challenge[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // Icons
  EditIcon = Edit;
  PlayIcon = Play;
  PauseIcon = Pause;
  TrashIcon = Trash2;
  PlusIcon = Plus;
  CalendarIcon = Calendar;
  TargetIcon = Target;
  ListIcon = List;
  XIcon = X;

  // Modal and Form
  challengeForm: FormGroup;
  isEditing = false;
  currentChallengeId: number | null = null;
  challengeModal: any;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.challengeForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required]],
      typeCode: ['', [Validators.required]],
      targetValue: [1, [Validators.required, Validators.min(1)]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadChallenges(this.currentPage);
  }

  ngAfterViewInit(): void {
    const modalElement = document.getElementById('challengeModal');
    if (modalElement) {
      this.challengeModal = new bootstrap.Modal(modalElement);
    }
  }

  loadChallenges(page: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.adminService.getAdminChallenges(page, this.pageSize)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.challenges = response.content;
          this.currentPage = response.number;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load challenges.';
          console.error(err);
        }
      });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.loadChallenges(newPage);
    }
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentChallengeId = null;
    this.challengeForm.reset({ targetValue: 1 });
    this.challengeModal.show();
  }

  openEditModal(challenge: Challenge): void {
    this.isEditing = true;
    this.currentChallengeId = challenge.id;
    
    // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
    const start = this.datePipe.transform(challenge.startDate, 'yyyy-MM-ddTHH:mm');
    const end = this.datePipe.transform(challenge.endDate, 'yyyy-MM-ddTHH:mm');

    this.challengeForm.patchValue({
      title: challenge.title,
      description: challenge.description,
      typeCode: challenge.typeCode,
      targetValue: challenge.targetValue,
      startDate: start,
      endDate: end
    });
    
    this.challengeModal.show();
  }

  closeModal(): void {
    this.challengeModal.hide();
  }

  saveChallenge(): void {
    if (this.challengeForm.invalid) {
      this.challengeForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    
    const request: ChallengeRequest = this.challengeForm.value;
    
    // Ensure correct ISO format by parsing and stringifying or just passing the datetime-local string directly 
    // Backend expects ISO LocalDateTime (e.g., '2023-10-15T10:00:00')
    if (request.startDate.length === 16) request.startDate += ':00';
    if (request.endDate.length === 16) request.endDate += ':00';

    const saveObs = this.isEditing && this.currentChallengeId
      ? this.adminService.updateChallenge(this.currentChallengeId, request)
      : this.adminService.createChallenge(request);

    saveObs.pipe(finalize(() => this.isSaving = false)).subscribe({
      next: () => {
        this.successMessage = `Challenge successfully ${this.isEditing ? 'updated' : 'created'}.`;
        this.closeModal();
        this.loadChallenges(this.currentPage);
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('Error saving challenge:', err);
        this.errorMessage = 'Failed to save challenge. Please check your inputs.';
      }
    });
  }

  moderateChallenge(id: number, action: string): void {
    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this challenge?`)) return;
    
    this.adminService.moderateChallenge(id, action).subscribe({
      next: () => {
        this.successMessage = `Challenge successfully ${action.toLowerCase()}d.`;
        this.loadChallenges(this.currentPage);
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('Error moderating challenge:', err);
        this.errorMessage = `Failed to ${action.toLowerCase()} challenge.`;
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  archiveChallenge(id: number): void {
    if (!confirm('Are you sure you want to archive this challenge? This action cannot be undone.')) return;
    
    this.adminService.archiveChallenge(id).subscribe({
      next: () => {
        this.successMessage = 'Challenge successfully archived.';
        this.loadChallenges(this.currentPage);
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('Error archiving challenge:', err);
        this.errorMessage = 'Failed to archive challenge.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'badge bg-success';
      case 'PENDING': return 'badge bg-warning text-dark';
      case 'COMPLETED': return 'badge bg-info';
      case 'CLOSED': return 'badge bg-secondary';
      case 'ARCHIVED': return 'badge bg-dark';
      default: return 'badge bg-light text-dark';
    }
  }
}
