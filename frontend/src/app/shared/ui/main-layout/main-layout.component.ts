import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { AuthService } from '../../../services/auth.service';
import { ToastContainerComponent } from '../toast-container/toast-container';
import { Subscription, filter } from 'rxjs';

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
        <!-- Mobile backdrop -->
        <div class="sidebar-backdrop"
             [class.active]="isSidebarVisible"
             (click)="closeSidebar()"></div>

        <app-sidebar class="layout-sidebar" [class.open]="isSidebarVisible"
                     (closeRequest)="closeSidebar()"></app-sidebar>
        
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
      position: relative;
    }
    
    .layout-sidebar {
      width: 260px;
      flex-shrink: 0;
      z-index: 40;
      background-color: var(--color-bg-card);
      border-right: 1px solid var(--color-border);
      display: none;
      transition: width 0.3s ease;
    }
    
    .layout-sidebar.open {
      display: flex;
    }
    
    .layout-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
      padding: 0.5rem;
    }

    /* Mobile backdrop overlay */
    .sidebar-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0);
      z-index: 1054;
      pointer-events: none;
      transition: background 0.3s ease;
    }

    @media (max-width: 991px) {
      /* On mobile: sidebar is a fixed overlay, NOT part of flex flow */
      .layout-sidebar {
        display: flex !important;   /* keep it rendered */
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 260px;
        z-index: 1055;
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 0.3s ease;
        box-shadow: none;
      }

      /* Open state: slide in */
      .layout-sidebar.open {
        display: flex !important;
        transform: translateX(0) !important;
        box-shadow: 4px 0 32px rgba(0, 0, 0, 0.22);
      }

      /* Content takes full width since sidebar is now fixed */
      .layout-content {
        padding: 1rem;
        width: 100%;
      }

      .sidebar-backdrop.active {
        display: block;
        background: rgba(0, 0, 0, 0.45);
        pointer-events: all;
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  isSidebarVisible = false;
  isSuspended = false;
  private routerSub!: Subscription;

  constructor(private authService: AuthService, private router: Router) {
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

  ngOnInit() {
    // Close sidebar automatically whenever the route changes (mobile nav)
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isSidebarVisible = false;
      });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  closeSidebar() {
    this.isSidebarVisible = false;
  }
}
