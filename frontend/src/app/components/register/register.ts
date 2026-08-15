import { Component, signal } from '@angular/core';
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
  errorMessage = signal('');
  successMessage = signal('');
  loading = signal(false);
  showPassword = signal(false);

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
    this.showPassword.set(!this.showPassword());
  }

  register() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    // Clean inputs
    const data = { ...this.registerForm.value };
    data.name = data.name.trim();
    data.email = data.email.trim().toLowerCase();

    this.authService.register(data)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: (res) => {
          this.successMessage.set(res.message || 'Registration successful! Redirecting to login...');
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        },
        error: (err) => {
          if (err.status === 0) {
            this.errorMessage.set('Network error. Please check your internet connection.');
          } else if (err.status === 409) {
            this.errorMessage.set(err.error?.message || err.error?.errors?.error || 'An account with this email already exists.');
          } else if (err.status === 400) {
            if (err.error?.errors?.error) {
              this.errorMessage.set(err.error.errors.error);
            } else if (err.error?.message) {
              this.errorMessage.set(err.error.message);
            } else {
              this.errorMessage.set('Invalid input. Please check your details.');
            }
          } else if (err.status === 500) {
            this.errorMessage.set('Unexpected server error. Please try again later.');
          } else {
            this.errorMessage.set(err.error?.message || 'Registration failed.');
          }
        }
      });
  }
}