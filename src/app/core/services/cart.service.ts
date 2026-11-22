import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, CartItem } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private _items = signal<CartItem[]>([]);
  private _subtotal = signal(0);
  private _loading = signal(false);
  readonly items = this._items.asReadonly();
  readonly subtotal = this._subtotal.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly totalItems = computed(() => this._items().reduce((sum, item) => sum + item.quantity, 0));

  loadCart() {
    if (!localStorage.getItem('kwikr_token')) { this.reset(); return; }
    this._loading.set(true);
    this.http.get<Cart>(`${environment.apiBaseUrl}/cart`).subscribe({
      next: cart => this.applyCart(cart),
      error: () => this.reset(),
      complete: () => this._loading.set(false)
    });
  }
  addItem(productId: number, quantity = 1) {
    return this.http.post<Cart>(`${environment.apiBaseUrl}/cart/items`, { productId, quantity })
      .pipe(tap(cart => this.applyCart(cart)));
  }
  updateQuantity(productId: number, quantity: number) {
    return this.http.put<Cart>(`${environment.apiBaseUrl}/cart/items/${productId}`, { quantity })
      .pipe(tap(cart => this.applyCart(cart)));
  }
  removeItem(productId: number) {
    return this.http.delete<Cart>(`${environment.apiBaseUrl}/cart/items/${productId}`)
      .pipe(tap(cart => this.applyCart(cart)));
  }
  clearCart() {
    return this.http.delete(`${environment.apiBaseUrl}/cart`).pipe(tap(() => this.reset()));
  }
  reset() { this._items.set([]); this._subtotal.set(0); this._loading.set(false); }
  private applyCart(cart: Cart) { this._items.set(cart.items); this._subtotal.set(cart.subtotal); }
}
