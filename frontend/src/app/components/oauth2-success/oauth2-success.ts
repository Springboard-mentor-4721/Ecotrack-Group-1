import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-oauth2-success',
  standalone: true,
  template: '<p>Authenticating...</p>'
})
export class OAuth2SuccessComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.authService.saveToken(token);
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/']);
      }
    });
  }
}
