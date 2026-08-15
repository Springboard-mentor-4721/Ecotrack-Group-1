import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  loginForm: FormGroup;
  errorMessage = signal('');
  loading = signal(false);
  forgotPasswordMode = signal(false);
  forgotPasswordMessage = signal('');
  showPassword = signal(false);

  // Animation state
  private mouseX = 0;
  private mouseY = 0;
  private animationFrameId: number | null = null;
  private boundMouseMove: ((e: MouseEvent) => void) | null = null;
  private leavesData = Array.from({length: 12}).map(() => ({ dx: 0, dy: 0 }));

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.boundMouseMove = this.onMouseMove.bind(this);
      document.addEventListener('mousemove', this.boundMouseMove);
      this.startAnimation();
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId) && this.boundMouseMove) {
      document.removeEventListener('mousemove', this.boundMouseMove);
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    }
  }

  private onMouseMove(e: MouseEvent) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  private startAnimation() {
    const updateLeaves = () => {
      const leaves = document.querySelectorAll('.leaf') as NodeListOf<HTMLElement>;
      if (leaves.length === 0) {
        this.animationFrameId = requestAnimationFrame(updateLeaves);
        return;
      }

      leaves.forEach((leaf, i) => {
        if (!this.leavesData[i]) return;
        const rect = leaf.getBoundingClientRect();
        const leafX = rect.left + rect.width / 2;
        const leafY = rect.top + rect.height / 2;
        
        const dist = Math.hypot(this.mouseX - leafX, this.mouseY - leafY);
        let targetDx = 0;
        let targetDy = 0;

        if (dist < 100) { // 100px radius interaction
          const force = (100 - dist) / 100;
          const angle = Math.atan2(leafY - this.mouseY, leafX - this.mouseX);
          targetDx = Math.cos(angle) * force * 20; // Drift away horizontally
          targetDy = Math.sin(angle) * force * 10 - (force * 15); // Bias upward lift
        }

        // Smooth recovery lerp
        this.leavesData[i].dx += (targetDx - this.leavesData[i].dx) * 0.05;
        this.leavesData[i].dy += (targetDy - this.leavesData[i].dy) * 0.05;

        if (Math.abs(this.leavesData[i].dx) > 0.1 || Math.abs(this.leavesData[i].dy) > 0.1 || targetDx !== 0) {
          leaf.style.setProperty('--dx', `${this.leavesData[i].dx}px`);
          leaf.style.setProperty('--dy', `${this.leavesData[i].dy}px`);
        }
      });
      this.animationFrameId = requestAnimationFrame(updateLeaves);
    };
    this.animationFrameId = requestAnimationFrame(updateLeaves);
  }

  togglePasswordVisibility(event: Event) {
    event.preventDefault();
    this.showPassword.set(!this.showPassword());
  }

  login() {
    this.loginForm.markAllAsTouched();
    
    // Clean inputs
    const emailControl = this.loginForm.get('email');
    if (emailControl?.value) emailControl.setValue(emailControl.value.trim().toLowerCase());
    
    if (this.forgotPasswordMode()) {
      if (emailControl?.invalid) return;
      this.loading.set(true);
      this.authService.forgotPassword(emailControl?.value)
        .pipe(
          finalize(() => {
            this.loading.set(false);
          })
        )
        .subscribe({
          next: (res: any) => {
            this.forgotPasswordMessage.set(res?.message || 'Password reset link sent to your email.');
            this.errorMessage.set('');
          },
          error: (err) => {
            this.forgotPasswordMessage.set('');
            if (err.status === 200) {
              // Edge case: Backend returned plain text success message, caught as JSON parsing error
              this.forgotPasswordMessage.set('Password reset link sent to your email.');
              this.errorMessage.set('');
            } else if (err.status === 0) this.errorMessage.set('Network error. Please check your internet connection.');
            else if (err.status === 400) this.errorMessage.set(err.error?.message || 'Invalid email format.');
            else if (err.status === 404) this.errorMessage.set('Email address not found.');
            else if (err.status === 500) this.errorMessage.set('Unexpected server error. Please try again later.');
            else this.errorMessage.set(err.error?.message || 'Failed to send reset link.');
          }
        });
      return;
    }

    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: (res) => {
          this.authService.saveToken(res.accessToken);
          
          try {
            const payload = JSON.parse(atob(res.accessToken.split('.')[1]));
            if (payload.role === 'ADMIN') {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          } catch (e) {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          if (err.status === 0) {
            this.errorMessage.set('Network error. Please check your internet connection.');
          } else if (err.status === 401 || err.status === 403) {
            this.errorMessage.set('Invalid email or password.');
          } else if (err.status === 400) {
            this.errorMessage.set(err.error?.message || 'Validation error.');
          } else if (err.status === 500) {
            this.errorMessage.set('Unexpected server error. Please try again later.');
          } else {
            this.errorMessage.set(err.error?.message || 'Invalid credentials.');
          }
        }
      });
  }

  googleLogin() {
    window.location.href = `${environment.apiUrl}/oauth2/authorization/google`;
  }

  toggleForgotPassword(event: Event) {
    event.preventDefault();
    this.forgotPasswordMode.set(!this.forgotPasswordMode());
    this.errorMessage.set('');
    this.forgotPasswordMessage.set('');
    if (this.forgotPasswordMode()) {
      this.loginForm.get('password')?.clearValidators();
    } else {
      this.loginForm.get('password')?.setValidators(Validators.required);
    }
    this.loginForm.get('password')?.updateValueAndValidity();
  }
}