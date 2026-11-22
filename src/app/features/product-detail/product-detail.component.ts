import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { AccentLoaderComponent } from '../../shared/components/accent-loader.component';
import { LucideX } from '@lucide/angular';

@Component({
  standalone: true,
  styleUrl: './product-detail.component.css',
  imports: [CurrencyPipe, AccentLoaderComponent, LucideX],
  template: `
    @if (loading()) {
      <div class="loading-page"><app-accent-loader label="Loading product..." /></div>
    } @else if (product(); as item) {
      <section class="detail-layout">
        <button
          type="button"
          class="detail-close"
          (click)="close()"
          title="Close"
          aria-label="Close product details"
        >
          <svg lucideX [size]="20"></svg>
        </button>
        <div class="detail-image">
          <img
            [src]="item.imageUrl || 'https://placehold.co/800x600?text=Kwikr'"
            [alt]="item.name"
          />
        </div>
        <div class="detail-info">
          <span class="category-pill">{{ item.categoryName }}</span>
          <h1>{{ item.name }}</h1>
          <div class="detail-price">{{ item.price | currency: 'INR' : 'symbol' : '1.0-2' }}</div>
          <p>{{ item.description }}</p>
          <div class="stock-line">
            In Stock
            @if (item.stockQuantity === 0) {
              <span class="stock out">Out of Stock</span>
            }
          </div>
          <label>Quantity</label>
          <div class="quantity-stepper">
            <button (click)="change(-1)" [disabled]="quantity() <= 1">−</button
            ><span>{{ quantity() }}</span
            ><button (click)="change(1)" [disabled]="quantity() >= item.stockQuantity">+</button>
          </div>
          <button
            class="btn primary full"
            [disabled]="item.stockQuantity === 0"
            (click)="add(item)"
          >
            Add to Cart
          </button>
        </div>
      </section>
    } @else {
      <div class="empty-state"><h2>Product not found</h2></div>
    }
  `,
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private products = inject(ProductService);
  private cart = inject(CartService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  product = signal<Product | null>(null);
  quantity = signal(1);
  loading = signal(true);
  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.products.getProductById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
  close() {
    this.router.navigate(['/']);
  }
  change(delta: number) {
    this.quantity.update((value) =>
      Math.max(1, Math.min(this.product()?.stockQuantity || 1, value + delta)),
    );
  }
  add(product: Product) {
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Please sign in to add items to your cart.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/products/${product.id}` } });
      return;
    }
    this.cart.addItem(product.id, this.quantity()).subscribe({
      next: () => this.toast.success(`${product.name} added to your cart.`),
      error: () => this.toast.error('Could not add this item.'),
    });
  }
}
