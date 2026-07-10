import { SidebarComponent } from '../sidebar/sidebar';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {}
