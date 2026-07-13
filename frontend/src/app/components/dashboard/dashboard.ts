import { SidebarComponent } from '../sidebar/sidebar';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  user: any;

  constructor(private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (response: string) => {
        // Safe fallback in case response is null or not a string
        const safeResponse = response ? String(response) : '';
        const email = safeResponse.replace('Authenticated as: ', '').trim();
        
        let name = 'User';
        let role = 'USER';
        
        // Try to get more details from JWT
        const token = this.authService.getToken();
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            name = payload.name || 'User';
            if (payload.role) role = payload.role;
          } catch(e) {}
        }
        
        this.user = {
          email: email || 'Unknown',
          name: name,
          role: role
        };
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load user profile', err);
        // Force UI out of loading state on error
        this.user = {
          email: 'Error loading profile',
          name: 'Error',
          role: 'UNKNOWN'
        };
        this.cdr.detectChanges();
      }
    });
  }
}
