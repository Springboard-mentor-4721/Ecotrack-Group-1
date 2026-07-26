import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-suspended',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './suspended.html',
  styleUrls: ['./suspended.css']
})
export class SuspendedComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
