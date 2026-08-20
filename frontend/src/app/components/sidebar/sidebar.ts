import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ConfirmationDialogService } from '../../shared/services/confirmation-dialog.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent implements OnInit {
  @Output() closeRequest = new EventEmitter<void>();
  userName = '';
  userEmail = '';
  userRole = '';
  isAdmin = false;
  isSuspended = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private dialog: ConfirmationDialogService
  ) {}

  ngOnInit() {
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userName = payload.name || 'User';
        this.userEmail = payload.sub || 'eco@track.com'; // Usually sub holds email
        this.userRole = payload.role || 'USER';
        this.isAdmin = this.userRole === 'ADMIN';
        this.isSuspended = payload.status === 'SUSPENDED';
      } catch (e) {}
    }
  }

  logout() {
    this.dialog.confirm('Are you sure you want to log out?').then((res) => {
      if (res) {
        this.authService.logout();
        this.router.navigate(['/']);
      }
    });
  }
}