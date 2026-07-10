import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  loading = false;
  showPassword = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-Z ]*$')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8), 
        Validators.maxLength(50),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*]).{8,}$')
      ]]
    });
  }

  togglePasswordVisibility(event: Event) {
    event.preventDefault();
    this.showPassword = !this.showPassword;
  }

  register() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Clean inputs
    const data = { ...this.registerForm.value };
    data.name = data.name.trim();
    data.email = data.email.trim().toLowerCase();

    this.authService.register(data)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (res) => {
          this.successMessage = res.message || 'Registration successful! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        },
        error: (err) => {
          if (err.status === 0) {
            this.errorMessage = 'Network error. Please check your internet connection.';
          } else if (err.status === 409) {
            this.errorMessage = err.error?.message || err.error?.errors?.error || 'An account with this email already exists.';
          } else if (err.status === 400) {
            if (err.error?.errors?.error) {
              this.errorMessage = err.error.errors.error;
            } else if (err.error?.message) {
              this.errorMessage = err.error.message;
            } else {
              this.errorMessage = 'Invalid input. Please check your details.';
            }
          } else if (err.status === 500) {
            this.errorMessage = 'Unexpected server error. Please try again later.';
          } else {
            this.errorMessage = err.error?.message || 'Registration failed.';
          }
        }
      });
  }
}