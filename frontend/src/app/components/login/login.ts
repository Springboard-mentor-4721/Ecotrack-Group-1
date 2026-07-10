import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  loading = false;
  forgotPasswordMode = false;
  forgotPasswordMessage = '';
  showPassword = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility(event: Event) {
    event.preventDefault();
    this.showPassword = !this.showPassword;
  }

  login() {
    this.loginForm.markAllAsTouched();
    
    // Clean inputs
    const emailControl = this.loginForm.get('email');
    if (emailControl?.value) emailControl.setValue(emailControl.value.trim().toLowerCase());
    
    if (this.forgotPasswordMode) {
      if (emailControl?.invalid) return;
      this.loading = true;
      this.authService.forgotPassword(emailControl?.value)
        .pipe(
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe({
          next: (res: any) => {
            this.forgotPasswordMessage = res?.message || 'Password reset link sent to your email.';
            this.errorMessage = '';
          },
          error: (err) => {
            this.forgotPasswordMessage = '';
            if (err.status === 200) {
              // Edge case: Backend returned plain text success message, caught as JSON parsing error
              this.forgotPasswordMessage = 'Password reset link sent to your email.';
              this.errorMessage = '';
            } else if (err.status === 0) this.errorMessage = 'Network error. Please check your internet connection.';
            else if (err.status === 400) this.errorMessage = err.error?.message || 'Invalid email format.';
            else if (err.status === 404) this.errorMessage = 'Email address not found.';
            else if (err.status === 500) this.errorMessage = 'Unexpected server error. Please try again later.';
            else this.errorMessage = err.error?.message || 'Failed to send reset link.';
          }
        });
      return;
    }

    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (res) => {
          this.authService.saveToken(res.accessToken);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          if (err.status === 0) {
            this.errorMessage = 'Network error. Please check your internet connection.';
          } else if (err.status === 401 || err.status === 403) {
            this.errorMessage = 'Invalid email or password.';
          } else if (err.status === 400) {
            this.errorMessage = err.error?.message || 'Validation error.';
          } else if (err.status === 500) {
            this.errorMessage = 'Unexpected server error. Please try again later.';
          } else {
            this.errorMessage = err.error?.message || 'Invalid credentials.';
          }
        }
      });
  }

  googleLogin() {
    window.location.href = `${environment.apiUrl}/oauth2/authorization/google`;
  }

  toggleForgotPassword(event: Event) {
    event.preventDefault();
    this.forgotPasswordMode = !this.forgotPasswordMode;
    this.errorMessage = '';
    this.forgotPasswordMessage = '';
    if (this.forgotPasswordMode) {
      this.loginForm.get('password')?.clearValidators();
    } else {
      this.loginForm.get('password')?.setValidators(Validators.required);
    }
    this.loginForm.get('password')?.updateValueAndValidity();
  }
}