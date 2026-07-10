import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  constructor(private router: Router) {}

  login() {
    this.router.navigate(['/dashboard']);
  }

}