import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  styleUrl: './account.component.css',
  imports: [RouterLink],
  template: `
    <section class="account-page">
      <div class="account-hero">
        <div class="account-avatar">{{ initials() }}</div>
        <div>
          <span class="eyebrow">KWIKR ACCOUNT</span>
          <h1>{{ auth.currentUser()?.fullName }}</h1>
          <p>{{ auth.currentUser()?.email }}</p>
        </div>
        <span class="account-role">{{ auth.currentUser()?.role }}</span>
      </div>

      <div class="account-layout">
        <aside class="account-menu">
          <a routerLink="/account" class="active"><span>👤</span> Account overview</a>
          <a routerLink="/orders"><span>📦</span> My orders</a>
          @if (auth.isAdmin()) { <a routerLink="/admin"><span>⚙</span> Admin dashboard</a> }
          <button type="button" (click)="logout()"><span>↪</span> Sign out</button>
        </aside>

        <div class="account-content">
          <div class="account-section-heading">
            <div>
              <span class="eyebrow">PERSONAL DETAILS</span>
              <h2>Account information</h2>
            </div>
          </div>

          <div class="account-details">
            <div class="account-detail">
              <span>Full name</span>
              <strong>{{ auth.currentUser()?.fullName }}</strong>
            </div>
            <div class="account-detail">
              <span>Email address</span>
              <strong>{{ auth.currentUser()?.email }}</strong>
            </div>
            <div class="account-detail">
              <span>Account type</span>
              <strong>{{ auth.currentUser()?.role }}</strong>
            </div>
            <div class="account-detail">
              <span>Customer ID</span>
              <strong>#{{ auth.currentUser()?.userId }}</strong>
            </div>
          </div>

          <div class="account-actions">
            <a class="btn primary" routerLink="/orders">View my orders</a>
            <a class="btn outline" routerLink="/cart">Go to cart</a>
          </div>
        </div>
      </div>
    </section>
  `
})
export class AccountComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  initials() {
    const name = this.auth.currentUser()?.fullName?.trim() || 'Account';
    return name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
