import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
        <div class="auth-visual-mark"><span>J</span></div>
        <div class="auth-visual-copy"><span class="eyebrow">JOIN KWIKR</span><h1>Shopping made<br>quick and simple.</h1></div>
        <div class="auth-orbit orbit-one"></div><div class="auth-orbit orbit-two"></div>
      </div>
      <form class="auth-card ps-auth-card" [formGroup]="form" (ngSubmit)="submit()">
      <span class="brand auth-brand">Kwikr<span>.</span></span><h1>Create account</h1><p class="auth-subtitle">Get started with Kwikr today</p>
      @if (error()) { <div class="form-error">{{ error() }}</div> }
      <label>Full Name<input formControlName="fullName" placeholder="Rohan Sharma"></label>
      @if (form.controls.fullName.touched && form.controls.fullName.invalid) { <small class="field-error">Full name is required.</small> }
      <label>Email<input type="email" formControlName="email" placeholder="rohan.sharma@gmail.com"></label>
      @if (form.controls.email.touched && form.controls.email.invalid) { <small class="field-error">Enter a valid email.</small> }
      <label>Password<input type="password" formControlName="password" placeholder="At least 6 characters"></label>
      @if (form.controls.password.touched && form.controls.password.invalid) { <small class="field-error">Use at least 6 characters.</small> }
      <button class="btn primary full" [disabled]="form.invalid || loading()">
        @if (loading()) { <app-accent-loader label="Creating..." [size]="18" /> } @else { Create Account }
      </button>
      <p class="auth-switch">Already have an account? <a routerLink="/login">Sign in</a></p>
    </form></div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  loading = signal(false); error = signal('');
  form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  submit() {
    if (this.form.invalid) return;
    this.loading.set(true); this.error.set('');
    const v = this.form.getRawValue();
    this.auth.register(v.fullName, v.email, v.password).subscribe({
      next: () => { this.toast.success('Account created!'); this.router.navigate(['/']); },
      error: err => { this.error.set(typeof err.error === 'string' ? err.error : 'Could not create account.'); this.loading.set(false); }
    });
  }
}
