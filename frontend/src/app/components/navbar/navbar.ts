import { Component, OnInit, HostListener, ElementRef, Output, EventEmitter, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { environment } from '../../../environments/environment';
import { ConfirmationDialogService } from '../../shared/services/confirmation-dialog.service';

import { NotificationBellComponent } from './notification-bell/notification-bell.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBellComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent implements OnInit {
  isDark = signal(false);
  isMenuOpen = signal(false);
  userProfile = signal<any>(null);
  isAdminUser = signal<boolean>(false);

  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService,
    private eRef: ElementRef,
    private dialog: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDark.set(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.isDark.set(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    this.isAdminUser.set(this.authService.isAdmin());
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    if (this.authService.isLoggedIn()) {
      this.profileService.getMyProfile().subscribe({
        next: (profile) => {
          this.userProfile.set(profile);
        },
        error: () => {
          console.warn('Failed to load profile for navbar, falling back to JWT');
          const token = this.authService.getToken();
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              this.userProfile.set({
                name: payload.name || 'User',
                email: payload.sub || ''
              });
            } catch(e) {
              this.userProfile.set({ name: 'User', email: '' });
            }
          } else {
            this.userProfile.set({ name: 'User', email: '' });
          }
        }
      });
    }
  }

  resolveImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('blob:')) return url;
    if (url.startsWith('http')) return url;
    const backendUrl = environment.apiUrl || 'http://localhost:8080';
    const basePath = url.startsWith('/') ? url : '/' + url;
    return backendUrl + basePath;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if(!this.eRef.nativeElement.contains(event.target)) {
      this.isMenuOpen.set(false);
    }
  }

  toggleMenu(): void {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  logout(): void {
    this.dialog.confirm('Are you sure you want to log out?').then((res) => {
      if (res) {
        this.authService.logout();
        sessionStorage.clear();
        this.router.navigate(['/'], { replaceUrl: true });
      }
    });
  }

  toggleTheme(): void {
    this.isDark.set(!this.isDark());
    if (this.isDark()) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }
}
