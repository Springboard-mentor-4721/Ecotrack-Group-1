import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfirmationDialogService } from '../../shared/services/confirmation-dialog.service';

@Component({
  selector: 'app-suspended',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './suspended.html',
  styleUrls: ['./suspended.css']
})
export class SuspendedComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: ConfirmationDialogService
  ) {}

  logout() {
    this.dialog.confirm('Are you sure you want to log out?').then((res) => {
      if (res) {
        this.authService.logout();
        this.router.navigate(['/']);
      }
    });
  }
}
