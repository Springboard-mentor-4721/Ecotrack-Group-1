import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { AuthService } from '../../../services/auth.service';
import { ToastContainerComponent } from '../toast-container/toast-container';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent, ToastContainerComponent],
  template: `
    <app-toast-container></app-toast-container>
    <div class="layout-wrapper">
      <div *ngIf="isSuspended" class="bg-danger text-white text-center py-2 fw-bold" style="position: sticky; top: 0; z-index: 1050; width: 100%;">
        Your account is suspended. Please contact the administrator.
      </div>
      <app-navbar class="layout-navbar" (toggleSidebar)="toggleSidebar()"></app-navbar>
      
      <div class="layout-body">
        <app-sidebar class="layout-sidebar" [class.open]="isSidebarVisible"></app-sidebar>
        
        <main class="layout-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background-color: var(--color-bg-body);
    }
    
    .layout-navbar {
      flex-shrink: 0;
      z-index: 50;
      width: 100%;
    }
    
    .layout-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    
    .layout-sidebar {
      width: 260px;
      flex-shrink: 0;
      z-index: 40;
      background-color: var(--color-bg-card);
      border-right: 1px solid var(--color-border);
      display: none; /* Hidden by default */
      transition: width 0.3s ease;
    }
    
    .layout-sidebar.open {
      display: flex; /* Sidebar component is a flex column */
    }
    
    .layout-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
      padding: 0.5rem;
    }
    
    @media (max-width: 768px) {
      .layout-content {
        padding: 1rem;
      }
    }
  `]
})
export class MainLayoutComponent {
  isSidebarVisible = false;
  isSuspended = false;

  constructor(private authService: AuthService) {
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.isSuspended = payload.status === 'SUSPENDED';
      } catch (e) {
        // ignore
      }
    }
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }
}
