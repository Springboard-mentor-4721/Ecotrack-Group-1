import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { SidebarComponent } from '../../../components/sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="layout-wrapper">
      <app-navbar class="layout-navbar"></app-navbar>
      
      <div class="layout-body">
        <app-sidebar class="layout-sidebar"></app-sidebar>
        
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
      width: 280px;
      flex-shrink: 0;
      z-index: 40;
      background-color: var(--color-bg-card);
      border-right: 1px solid var(--color-border);
    }
    
    .layout-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
    }
    
    @media (max-width: 991px) {
      .layout-sidebar {
        display: none; /* In a real app, we'd use a drawer here */
      }
    }
  `]
})
export class MainLayoutComponent {}
