import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AccentLoaderComponent } from '../../shared/components/accent-loader.component';

@Component({
  standalone: true,
  styleUrl: './auth.component.css',
  imports: [ReactiveFormsModule, RouterLink, AccentLoaderComponent],
  template: `
    <div class="auth-page ps-auth-page">
      <div class="auth-visual">
        <div class="auth-visual-mark"><span>K</span></div>
        <div class="auth-visual-copy"><span class="eyebrow">KWIKR INDIA</span><h1>Groceries. Gadgets.<br>Delivered in minutes.</h1></div>
        <div class="auth-orbit orbit-one"></div><div class="auth-orbit orbit-two"></div>
      </div>
      <form class="auth-card ps-auth-card" [formGroup]="form" (ngSubmit)="submit()">
      <span class="brand auth-brand">Kwikr<span>.</span></span><h1>Sign in</h1><p class="auth-subtitle">Welcome back to your Kwikr account</p>
      @if (error()) { <div class="form-error">{{ error() }}</div> }
      <label>Email<input type="email" formControlName="email" placeholder="rohan.sharma@gmail.com"></label>
      @if (form.controls.email.touched && form.controls.email.invalid) { <small class="field-error">Enter a valid email.</small> }
      <label>Password<input type="password" formControlName="password" placeholder="Your password"></label>
      @if (form.controls.password.touched && form.controls.password.invalid) { <small class="field-error">Password is required.</small> }
      <button class="btn primary full" [disabled]="form.invalid || loading()">
        @if (loading()) { <app-accent-loader label="Signing in..." [size]="18" /> } @else { Sign In }
      </button>
      <p class="auth-switch">New to Kwikr? <a routerLink="/register">Create an account</a></p>
    </form></div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  loading = signal(false);
  error = signal('');
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  submit() {
    if (this.form.invalid) return;
    this.loading.set(true); this.error.set('');
    const value = this.form.getRawValue();
    this.auth.login(value.email, value.password).subscribe({
      next: () => {
        this.toast.success('Welcome back!');
        if (this.auth.isAdmin()) {
          this.router.navigateByUrl('/admin');
          return;
        }
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: err => { this.error.set(typeof err.error === 'string' ? err.error : 'Invalid email or password.'); this.loading.set(false); }
    });
  }
}
