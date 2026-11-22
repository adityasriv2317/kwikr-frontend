import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ThemeService } from '../../core/services/theme.service';
import { LucideSearch, LucideShoppingCart, LucideSun, LucideMoon } from '@lucide/angular';

@Component({
  selector: 'app-navbar',
  styleUrl: './navbar.component.css',
  imports: [RouterLink, FormsModule, LucideSearch, LucideShoppingCart, LucideSun, LucideMoon],
  template: `
    <header class="navbar">
      <a class="brand app-brand" routerLink="/" aria-label="Kwikr home">
        <img src="icon.png" alt="">
        <span>Kwikr<span>.</span></span>
      </a>
      <form class="navbar-search" (submit)="search()">
        <input
          [(ngModel)]="searchText"
          name="search"
          placeholder="Search products"
          aria-label="Search products"
        />
        <button type="submit" aria-label="Search"><svg lucideSearch [size]="18"></svg></button>
      </form>
      <nav class="nav-actions">
        <button
          class="theme-toggle"
          type="button"
          (click)="theme.toggle()"
          [attr.aria-label]="
            theme.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
          "
          [title]="theme.theme() === 'dark' ? 'Light mode' : 'Dark mode'"
        >
          @if (theme.theme() === 'dark') {
            <svg lucideSun [size]="18"></svg>
          } @else {
            <svg lucideMoon [size]="18"></svg>
          }
        </button>
        <a class="cart-button" routerLink="/cart">
          <svg lucideShoppingCart [size]="18"></svg><span>Cart</span>
          <span class="badge">{{ cart.totalItems() }}</span>
        </a>
        @if (auth.isAuthenticated()) {
          <a routerLink="/orders">My Orders</a>
          @if (auth.isAdmin()) {
            <a class="admin-link" routerLink="/admin">Admin</a>
          }
          <a class="account-link" routerLink="/account" [title]="auth.currentUser()?.fullName">
            <span class="avatar">{{ initials() }}</span>
            <span class="user-name">{{ firstName() }}</span>
          </a>
          <button class="link-button" (click)="logout()">Logout</button>
        } @else {
          <a routerLink="/login">Sign In</a>
          <a class="btn primary compact" routerLink="/register">Sign Up</a>
        }
      </nav>
    </header>
  `,
})
export class NavbarComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  theme = inject(ThemeService);
  private router = inject(Router);
  searchText = '';
  firstName() {
    return this.auth.currentUser()?.fullName.split(' ')[0] || 'Account';
  }
  initials() {
    const name = this.auth.currentUser()?.fullName?.trim() || 'Account';
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
  search() {
    this.router.navigate(['/'], { queryParams: { search: this.searchText || null } });
  }
  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
