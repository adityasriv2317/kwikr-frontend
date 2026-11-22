import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { AccentLoaderComponent } from '../../shared/components/accent-loader.component';
import { LucideTrash } from '@lucide/angular';

@Component({
  standalone: true,
  styleUrl: './cart.component.css',
  imports: [CurrencyPipe, RouterLink, AccentLoaderComponent, LucideTrash],
  template: `
    <section class="page-heading">
      <div>
        <span class="eyebrow">YOUR BAG</span>
        <h1>Shopping Cart</h1>
      </div>
    </section>
    @if (cart.loading()) {
      <div class="loading-page"><app-accent-loader label="Loading cart..." /></div>
    } @else if (cart.items().length === 0) {
      <div class="empty-state">
        <h2>Your cart is empty</h2>
        <p>Add something you love.</p>
        <a class="btn primary" routerLink="/">Browse Products</a>
      </div>
    } @else {
      <div class="cart-layout">
        <div class="cart-list">
          @for (item of cart.items(); track item.productId) {
            <article class="cart-item">
              <img [src]="item.imageUrl" [alt]="item.name" />
              <div class="cart-item-info">
                <h3>{{ item.name }}</h3>
                <strong>{{ item.price | currency: 'INR' : 'symbol' : '1.0-2' }}</strong>
              </div>
              <div class="quantity-stepper">
                <button
                  (click)="change(item.productId, item.quantity - 1)"
                  [disabled]="item.quantity <= 1"
                >
                  −</button
                ><span>{{ item.quantity }}</span
                ><button
                  (click)="change(item.productId, item.quantity + 1)"
                  [disabled]="item.quantity >= item.stockQuantity"
                >
                  +
                </button>
              </div>
              <strong class="line-total">{{
                item.price * item.quantity | currency: 'INR' : 'symbol' : '1.0-2'
              }}</strong>
              <button
                class="remove-button"
                type="button"
                [attr.aria-label]="'Remove ' + item.name"
                title="Remove item"
                (click)="remove(item.productId)"
              >
                <svg lucideTrash [size]="16"></svg>
              </button>
            </article>
          }
        </div>
        <aside class="summary-card">
          <h2>Order Summary</h2>
          <div class="summary-row">
            <span>Items</span><strong>{{ cart.totalItems() }}</strong>
          </div>
          <div class="summary-row">
            <span>Subtotal</span
            ><strong>{{ cart.subtotal() | currency: 'INR' : 'symbol' : '1.0-2' }}</strong>
          </div>
          <button class="btn outline full" (click)="clear()">Clear Cart</button>
          <a class="btn primary full" routerLink="/checkout">Proceed to Checkout</a>
        </aside>
      </div>
    }
  `,
})
export class CartComponent {
  cart = inject(CartService);
  private toast = inject(ToastService);
  constructor() {
    this.cart.loadCart();
  }
  change(productId: number, quantity: number) {
    this.cart
      .updateQuantity(productId, quantity)
      .subscribe({ error: () => this.toast.error('Could not update quantity.') });
  }
  remove(productId: number) {
    this.cart
      .removeItem(productId)
      .subscribe({
        next: () => this.toast.info('Item removed.'),
        error: () => this.toast.error('Could not remove item.'),
      });
  }
  clear() {
    this.cart.clearCart().subscribe({ next: () => this.toast.info('Cart cleared.') });
  }
}
