import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { AccentLoaderComponent } from '../../shared/components/accent-loader.component';
import { LucideSlidersHorizontal } from '@lucide/angular';

@Component({
  standalone: true,
  styleUrl: './home.component.css',
  imports: [FormsModule, ProductCardComponent, AccentLoaderComponent, LucideSlidersHorizontal],
  template: `
    <section class="hero">
      <div><span class="eyebrow">SHOPPER?  KWIKR.</span><h1>Everything tech, delivered kwickly.</h1></div>
      <div class="hero-mark">K</div>
    </section>
    <section class="catalog">
      <div class="catalog-toolbar">
        <div class="category-pills">
          <button class="pill" [class.active]="selectedCategory() === null" (click)="chooseCategory(null)">All</button>
          @for (category of categories(); track category.id) {
            <button class="pill" [class.active]="selectedCategory() === category.id" (click)="chooseCategory(category.id)">
              {{ category.name }}
            </button>
          }
        </div>
        <label class="sort-control">
          <svg lucideSlidersHorizontal [size]="16"></svg>
          <select [(ngModel)]="sort" name="sort" aria-label="Sort products" (ngModelChange)="applySort()">
          <option value="featured">Featured</option><option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option><option value="name">Name A-Z</option>
          </select>
        </label>
      </div>
      @if (loading()) { <div class="catalog-loading"><app-accent-loader label="Loading products..." /></div> }
      @else if (error()) { <div class="empty-state"><h3>Unable to load products</h3><p>{{ error() }}</p><button class="btn" (click)="load()">Try Again</button></div> }
      @else if (products().length === 0) { <div class="empty-state"><h3>No products found</h3><p>Try another search or category.</p></div> }
      @else { <div class="product-grid">@for (product of products(); track product.id) { <app-product-card [product]="product" /> }</div> }
    </section>
  `
})
export class HomeComponent {
  private productsService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal('');
  selectedCategory = signal<number | null>(null);
  search = '';
  sort = 'featured';

  constructor() {
    this.route.queryParamMap.subscribe(params => { this.search = params.get('search') || ''; this.load(); });
    this.categoryService.getCategories().subscribe({ next: categories => this.categories.set(categories), error: () => {} });
  }
  chooseCategory(id: number | null) { this.selectedCategory.set(id); this.load(); }
  load() {
    this.loading.set(true); this.error.set('');
    this.productsService.getProducts({ search: this.search, categoryId: this.selectedCategory() || undefined }).subscribe({
      next: products => { this.products.set(products); this.applySort(); this.loading.set(false); },
      error: err => { this.error.set(err.error || 'Please check that the API is running.'); this.loading.set(false); }
    });
  }
  applySort() {
    const sorted = [...this.products()];
    if (this.sort === 'priceAsc') sorted.sort((a,b) => a.price - b.price);
    if (this.sort === 'priceDesc') sorted.sort((a,b) => b.price - a.price);
    if (this.sort === 'name') sorted.sort((a,b) => a.name.localeCompare(b.name));
    this.products.set(sorted);
  }
}
