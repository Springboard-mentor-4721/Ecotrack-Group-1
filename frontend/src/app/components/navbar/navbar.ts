import { Component, OnInit, HostListener, ElementRef, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent implements OnInit {
  isDark = false;
  isMenuOpen = false;
  userProfile: any = null;

  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService,
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDark = true;
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    if (this.authService.isLoggedIn()) {
      this.profileService.getMyProfile().subscribe({
        next: (profile) => this.userProfile = profile,
        error: () => {
          console.warn('Failed to load profile for navbar, falling back to JWT');
          const token = this.authService.getToken();
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              this.userProfile = {
                name: payload.name || 'User',
                email: payload.sub || ''
              };
            } catch(e) {
              this.userProfile = { name: 'User', email: '' };
            }
          } else {
            this.userProfile = { name: 'User', email: '' };
          }
        }
      });
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if(!this.eRef.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    sessionStorage.clear();
    this.router.navigate(['/'], { replaceUrl: true });
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    if (this.isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }
}
