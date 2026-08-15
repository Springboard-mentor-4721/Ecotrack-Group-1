import { Component, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token = signal('');
  errorMessage = signal('');
  successMessage = signal('');
  loading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.maxLength(50),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*]).{8,}$')
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  togglePasswordVisibility(event: Event) {
    event.preventDefault();
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility(event: Event) {
    event.preventDefault();
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token.set(params['token'] || '');
      if (!this.token()) {
        this.errorMessage.set('Invalid password reset link.');
      }
    });
  }

  resetPassword() {
    this.resetForm.markAllAsTouched();
    if (this.resetForm.invalid || !this.token()) return;

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = {
      token: this.token(),
      newPassword: this.resetForm.get('newPassword')?.value
    };

    this.authService.resetPassword(payload)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: (res) => {
          this.successMessage.set(res.message || 'Password successfully reset!');
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        },
        error: (err) => {
          if (err.status === 0) {
            this.errorMessage.set('Network error. Please check your internet connection.');
          } else if (err.status === 400) {
            this.errorMessage.set(err.error?.message || 'Invalid or expired reset token.');
          } else if (err.status === 500) {
            this.errorMessage.set('Unexpected server error. Please try again later.');
          } else {
            this.errorMessage.set(err.error?.message || 'Failed to reset password.');
          }
        }
      });
  }
}
