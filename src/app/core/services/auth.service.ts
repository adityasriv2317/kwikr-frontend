import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, UserSummary } from '../models/auth.model';
import { CartService } from './cart.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private cart = inject(CartService);
  private _currentUser = signal<UserSummary | null>(this.readStoredUser());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'Admin');
  readonly token = signal<string | null>(localStorage.getItem('kwikr_token'));

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password })
      .pipe(tap(response => this.acceptSession(response)));
  }
  register(fullName: string, email: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/register`,
      { fullName, email, password }).pipe(tap(response => this.acceptSession(response)));
  }
  logout() {
    localStorage.removeItem('kwikr_token');
    localStorage.removeItem('kwikr_user');
    this.token.set(null);
    this._currentUser.set(null);
    this.cart.reset();
  }
  loadCurrentUser() {
    if (!this.token()) { this._currentUser.set(null); return; }
    this.http.get<UserSummary>(`${environment.apiBaseUrl}/auth/me`).subscribe({
      next: user => this.acceptUser(user),
      error: () => this.logout()
    });
  }
  clearInvalidSession() { this.logout(); }
  private acceptSession(response: AuthResponse) {
    localStorage.setItem('kwikr_token', response.token);
    this.token.set(response.token);
    this.acceptUser({
      userId: response.userId,
      fullName: response.fullName,
      email: response.email,
      role: response.role
    });
  }
  private acceptUser(user: UserSummary) {
    localStorage.setItem('kwikr_user', JSON.stringify(user));
    this._currentUser.set(user);
    this.cart.loadCart();
  }
  private readStoredUser(): UserSummary | null {
    try { return JSON.parse(localStorage.getItem('kwikr_user') || 'null'); }
    catch { return null; }
  }
}
