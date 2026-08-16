import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent implements OnInit {
  userName = '';
  userEmail = '';
  userRole = '';
  isAdmin = false;
  isSuspended = false;

  constructor(private authService: AuthService, private router: Router) {}

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
    if (window.confirm('Are you sure you want to log out?')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }
}