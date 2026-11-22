import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  standalone: true,
  styleUrl: './checkout.component.css',
  imports: [CurrencyPipe, ReactiveFormsModule],
  template: `
    <section class="page-heading"><div><span class="eyebrow">FINAL STEP</span><h1>Checkout</h1></div></section>
    @if (cart.items().length === 0) { <div class="empty-state"><h2>Your cart is empty</h2></div> }
    @else {
      <div class="checkout-layout">
        <form class="checkout-form" [formGroup]="form" (ngSubmit)="placeOrder()">
          <h2>Delivery Details</h2>
          <label>Full name<input formControlName="fullName" placeholder="Rohan Sharma"></label>
          <label>Shipping address<input formControlName="shippingAddress" placeholder="42, MG Road, Bengaluru"></label>
          <div class="form-row"><label>City<input formControlName="city" placeholder="Bengaluru"></label><label>Postal code<input formControlName="postalCode" placeholder="560001"></label></div>
          @if (error()) { <div class="form-error">{{ error() }}</div> }
          <button class="btn primary full" [disabled]="form.invalid || placing()">{{ placing() ? 'Placing Order...' : 'Place Order' }}</button>
        </form>
        <aside class="summary-card"><h2>Review Order</h2>
          @for (item of cart.items(); track item.productId) { <div class="summary-product"><span>{{ item.name }} × {{ item.quantity }}</span><strong>{{ item.price * item.quantity | currency:'INR':'symbol':'1.0-2' }}</strong></div> }
          <div class="summary-row total"><span>Total</span><strong>{{ cart.subtotal() | currency:'INR':'symbol':'1.0-2' }}</strong></div>
        </aside>
      </div>
    }
  `
})
export class CheckoutComponent {
  cart = inject(CartService);
  private fb = inject(FormBuilder);
  private orders = inject(OrderService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  placing = signal(false); error = signal('');
  form = this.fb.nonNullable.group({
    fullName: [this.auth.currentUser()?.fullName || '', Validators.required],
    shippingAddress: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['', Validators.required]
  });
  constructor() { this.cart.loadCart(); }
  placeOrder() {
    if (this.form.invalid) return;
    this.placing.set(true); this.error.set('');
    this.orders.checkout(this.form.getRawValue()).subscribe({
      next: () => { this.cart.reset(); this.toast.success('Order placed successfully!'); this.router.navigate(['/orders']); },
      error: err => { this.error.set(typeof err.error === 'string' ? err.error : 'Could not place your order.'); this.placing.set(false); }
    });
  }
}
