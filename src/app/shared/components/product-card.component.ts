import { Component, computed, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-product-card',
  styleUrl: './product-card.component.css',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <article class="product-card">
      <a [routerLink]="['/products', product().id]" class="product-image">
        <img [src]="product().imageUrl || 'https://placehold.co/600x450?text=Kwikr'"
             [alt]="product().name" (error)="onImageError($event)">
      </a>
      <div class="product-card-body">
        <span class="category-pill">{{ product().categoryName }}</span>
        <a [routerLink]="['/products', product().id]"><h3>{{ product().name }}</h3></a>
        <div class="product-card-meta">
          <strong>{{ product().price | currency:'INR':'symbol':'1.0-2' }}</strong>
          @if (product().stockQuantity === 0) { <span class="stock out">Out of Stock</span> }
          @else if (product().stockQuantity <= 5) { <span class="stock low">Low Stock</span> }
          @else { <span class="stock">In Stock</span> }
        </div>
        @if (quantity() > 0) {
          <div class="product-card-stepper" aria-label="Cart quantity">
            <button type="button" (click)="decrease()" [attr.aria-label]="'Decrease ' + product().name">−</button>
            <strong>{{ quantity() }}</strong>
            <button type="button" (click)="increase()" [disabled]="quantity() >= product().stockQuantity"
              [attr.aria-label]="'Increase ' + product().name">+</button>
          </div>
        } @else {
          <button class="btn primary full" [disabled]="product().stockQuantity === 0"
            (click)="addToCart()">Add to Cart</button>
        }
      </div>
    </article>
  `
})
export class ProductCardComponent {
  product = input.required<Product>();
  private cart = inject(CartService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  quantity = computed(() =>
    this.cart.items().find(item => item.productId === this.product().id)?.quantity ?? 0
  );
  addToCart() {
    if (!this.auth.isAuthenticated()) { this.toast.info('Please sign in to add items to your cart.'); return; }
    this.cart.addItem(this.product().id).subscribe({ error: () => this.toast.error('Could not add this item.') });
  }
  increase() {
    if (!this.auth.isAuthenticated()) { this.toast.info('Please sign in to update your cart.'); return; }
    const nextQuantity = this.quantity() + 1;
    if (nextQuantity > this.product().stockQuantity) return;
    this.cart.updateQuantity(this.product().id, nextQuantity)
      .subscribe({ error: () => this.toast.error('Could not update this item.') });
  }
  decrease() {
    if (!this.auth.isAuthenticated()) { this.toast.info('Please sign in to update your cart.'); return; }
    const nextQuantity = this.quantity() - 1;
    const request = nextQuantity === 0
      ? this.cart.updateQuantity(this.product().id, 0)
      : this.cart.updateQuantity(this.product().id, nextQuantity);
    request.subscribe({ error: () => this.toast.error('Could not update this item.') });
  }
  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://placehold.co/600x450?text=Kwikr';
  }
}
