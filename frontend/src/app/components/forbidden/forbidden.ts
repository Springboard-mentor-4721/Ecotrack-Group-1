import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="container text-center mt-5">
      <h1 class="display-1 text-danger">403</h1>
      <h2 class="mb-4">Access Denied</h2>
      <p class="lead mb-5">You don't have permission to view this page.</p>
      <a routerLink="/dashboard" class="btn btn-primary">Return to Dashboard</a>
    </div>
  `
})
export class ForbiddenComponent {}
