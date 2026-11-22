import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideLayoutDashboard,
  LucidePackage,
  LucideWarehouse,
  LucideReceiptText,
  LucideTags,
  LucideUsers,
  LucideLogOut,
  LucideRefreshCw,
  LucidePlus,
  LucideSearch,
  LucidePencil,
  LucideTrash,
  LucideX,
  LucideDollarSign,
  LucideUserRound,
  LucideAlertTriangle,
} from '@lucide/angular';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { OrderService } from '../../core/services/order.service';
import { AdminService, AdminDashboard, AdminUser } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { Order } from '../../core/models/order.model';

type AdminTab = 'overview' | 'products' | 'inventory' | 'orders' | 'categories';

@Component({
  standalone: true,
  styleUrl: './admin.component.css',
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    LucideLayoutDashboard,
    LucidePackage,
    LucideWarehouse,
    LucideReceiptText,
    LucideTags,
    LucideUsers,
    LucideLogOut,
    LucideRefreshCw,
    LucidePlus,
    LucideSearch,
    LucidePencil,
    LucideTrash,
    LucideX,
    LucideDollarSign,
    LucideUserRound,
    LucideAlertTriangle,
  ],
  template: `
    <section class="admin-shell">
      <aside class="admin-sidebar">
        <div class="admin-brand">
          <img src="/icon.png" />
          <div><span>KWIKR STORE</span><strong>Control center</strong></div>
        </div>
        <nav>
          @for (item of tabs; track item.id) {
            <button [class.active]="tab() === item.id" (click)="tab.set(item.id)">
              <span class="nav-symbol">
                @switch (item.id) {
                  @case ('overview') {
                    <svg lucideLayoutDashboard [size]="19"></svg>
                  }
                  @case ('products') {
                    <svg lucidePackage [size]="19"></svg>
                  }
                  @case ('inventory') {
                    <svg lucideWarehouse [size]="19"></svg>
                  }
                  @case ('orders') {
                    <svg lucideReceiptText [size]="19"></svg>
                  }
                  @case ('categories') {
                    <svg lucideTags [size]="19"></svg>
                  }
                }
              </span>
              <span class="nav-label">{{ item.label }}</span>
              @if (item.id === 'inventory' && dashboard()?.lowStockCount) {
                <span class="nav-count">{{ dashboard()?.lowStockCount }}</span>
              }
            </button>
          }
        </nav>

        <div class="sidebar-spacer">
          <span class="admin-date">{{ today() | date: 'EEE, MMM d' }}</span>
          <div class="sidebar-account">
            <div class="admin-avatar">{{ initials() }}</div>
            <div class="account-copy">
              <strong>{{ auth.currentUser()?.fullName }}</strong><small>Administrator</small>
            </div>
            <button
              type="button"
              class="logout-icon"
              (click)="logout()"
              title="Log out"
              aria-label="Log out"
            >
              <svg lucideLogOut [size]="18"></svg>
            </button>
          </div>
        </div>
      </aside>

      <main class="admin-content">
        @if (tab() === 'overview') {
          <div class="section-heading">
            <div>
              <span class="eyebrow">TODAY'S SNAPSHOT</span>
              <h2>Store overview</h2>
            </div>
            <button class="btn outline" (click)="refresh()">
              <svg lucideRefreshCw [size]="16"></svg> Refresh
            </button>
          </div>
          @if (dashboard(); as stats) {
            <div class="stat-grid">
              <article>
                <div class="stat-icon revenue"><svg lucideDollarSign [size]="19"></svg></div>
                <span>Revenue</span
                ><strong>{{ stats.totalRevenue | currency: 'INR' : 'symbol' : '1.0-0' }}</strong
                ><small>Excluding cancelled orders</small>
              </article>
              <article>
                <div class="stat-icon"><svg lucideReceiptText [size]="19"></svg></div>
                <span>Orders</span><strong>{{ stats.orderCount }}</strong
                ><small>{{ stats.pendingOrderCount }} awaiting action</small>
              </article>
              <article>
                <div class="stat-icon"><svg lucideUserRound [size]="19"></svg></div>
                <span>Customers</span><strong>{{ stats.customerCount }}</strong
                ><small>Registered accounts</small>
              </article>
              <article>
                <div class="stat-icon alert"><svg lucideAlertTriangle [size]="19"></svg></div>
                <span>Low stock</span><strong>{{ stats.lowStockCount }}</strong
                ><small>At 5 units or less</small>
              </article>
            </div>
          }
          <div class="overview-grid">
            <section class="panel">
              <div class="panel-heading">
                <h3>Inventory alerts</h3>
                <button class="text-action" (click)="tab.set('inventory')">View all</button>
              </div>
              @for (product of lowStockProducts(); track product.id) {
                <div class="alert-row">
                  <div>
                    <strong>{{ product.name }}</strong><small>{{ product.categoryName }}</small>
                  </div>
                  <span [class.critical]="product.stockQuantity === 0"
                    >{{ product.stockQuantity }} left</span
                  >
                </div>
              } @empty {
                <p class="muted">All inventory levels are healthy.</p>
              }
            </section>
            <section class="panel">
              <div class="panel-heading">
                <h3>Recent orders</h3>
                <button class="text-action" (click)="tab.set('orders')">View all</button>
              </div>
              @for (order of orders().slice(0, 5); track order.id) {
                <div class="alert-row">
                  <div>
                    <strong>#{{ order.id }} · {{ order.customerName || 'Customer' }}</strong
                    ><small>{{ order.createdAt | date: 'MMM d, y' }}</small>
                  </div>
                  <span>{{ order.totalAmount | currency: 'INR' : 'symbol' : '1.0-0' }}</span>
                </div>
              } @empty {
                <p class="muted">No orders yet.</p>
              }
            </section>
          </div>
        }

        @if (tab() === 'products' || tab() === 'inventory') {
          <div class="section-heading">
            <div>
              <span class="eyebrow">{{ tab() === 'inventory' ? 'STOCK CONTROL' : 'CATALOG' }}</span>
              <h2>{{ tab() === 'inventory' ? 'Inventory' : 'Products' }}</h2>
            </div>
            @if (tab() === 'products') {
              <button class="btn primary" (click)="showProductForm.set(true)">
                <svg lucidePlus [size]="17"></svg> Add product
              </button>
            }
          </div>
          @if (showProductForm() || editingId()) {
            <form class="product-form panel" [formGroup]="productForm" (ngSubmit)="saveProduct()">
              <div class="panel-heading">
                <h3>{{ editingId() ? 'Edit product' : 'New product' }}</h3>
                <button type="button" class="icon-button" (click)="resetForm()" aria-label="Close">
                  <svg lucideX [size]="18"></svg>
                </button>
              </div>
              <div class="form-grid">
                <label>Name<input formControlName="name" placeholder="Product name" /></label>
                <label
                  >Category<select formControlName="categoryId">
                    <option [value]="0" disabled>Select category</option>
                    @for (category of categories(); track category.id) {
                      <option [value]="category.id">{{ category.name }}</option>
                    }
                  </select></label
                >
                <label>Price (₹)<input type="number" min="0.01" formControlName="price" /></label>
                <label
                  >Stock quantity<input type="number" min="0" formControlName="stockQuantity"
                /></label>
                <label class="wide"
                  >Description<textarea
                    formControlName="description"
                    placeholder="A concise product description"
                  ></textarea>
                </label>
                <label class="wide"
                  >Image URL<input formControlName="imageUrl" placeholder="https://..."
                /></label>
              </div>
              <div class="form-actions">
                <button type="button" class="btn outline" (click)="resetForm()">Cancel</button
                ><button class="btn primary" [disabled]="productForm.invalid">
                  {{ editingId() ? 'Save changes' : 'Create product' }}
                </button>
              </div>
            </form>
          }
          <div class="toolbar">
            <div class="search-control">
              <svg lucideSearch [size]="17"></svg
              ><input
                class="search-field"
                [(ngModel)]="productSearch"
                (ngModelChange)="filterProducts()"
                placeholder="Search products"
              />
            </div>
            <select [(ngModel)]="stockFilter" (ngModelChange)="filterProducts()">
              <option value="all">All stock levels</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>
          </div>
          <div class="table-wrap panel">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (product of filteredProducts(); track product.id) {
                  <tr>
                    <td>
                      <strong>{{ product.name }}</strong>
                    </td>
                    <td>{{ product.categoryName }}</td>
                    <td>{{ product.price | currency: 'INR' : 'symbol' : '1.0-2' }}</td>
                    <td>
                      <b [class.stock-low]="product.stockQuantity <= 5">{{
                        product.stockQuantity
                      }}</b>
                    </td>
                    <td>
                      <span
                        class="status"
                        [class.low]="product.stockQuantity <= 5"
                        [class.out]="product.stockQuantity === 0"
                        >{{
                          product.stockQuantity === 0
                            ? 'Out of stock'
                            : product.stockQuantity <= 5
                              ? 'Low stock'
                              : 'In stock'
                        }}</span
                      >
                    </td>
                    <td class="row-actions">
                      <button (click)="edit(product)" title="Edit">
                        <svg lucidePencil [size]="16"></svg></button
                      ><button class="danger" (click)="remove(product.id)" title="Delete">
                        <svg lucideTrash [size]="16"></svg>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="empty-row">No products found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (tab() === 'orders') {
          <div class="section-heading">
            <div>
              <span class="eyebrow">FULFILMENT</span>
              <h2>Orders</h2>
            </div>
          </div>
          <div class="toolbar">
            <div class="search-control">
              <svg lucideSearch [size]="17"></svg
              ><input
                [(ngModel)]="orderSearch"
                (ngModelChange)="filterOrders()"
                placeholder="Search orders or customers"
              />
            </div>
            <select [(ngModel)]="orderStatus" (ngModelChange)="loadOrders()">
              <option value="">All statuses</option>
              <option>Pending</option>
              <option>Paid</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div class="table-wrap panel">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (order of filteredOrders(); track order.id) {
                  <tr>
                    <td>
                      <strong>#{{ order.id }}</strong>
                    </td>
                    <td>
                      <strong>{{ order.customerName || 'Customer' }}</strong><small>{{
                        order.customerEmail
                      }}</small>
                    </td>
                    <td>{{ order.createdAt | date: 'MMM d, y, h:mm a' }}</td>
                    <td>{{ order.totalAmount | currency: 'INR' : 'symbol' : '1.0-2' }}</td>
                    <td>
                      <select
                        class="status-select"
                        [ngModel]="order.status"
                        (ngModelChange)="changeStatus(order.id, $event)"
                      >
                        <option>Pending</option>
                        <option>Paid</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </select>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="empty-row">No orders match this filter.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (tab() === 'categories') {
          <div class="section-heading">
            <div>
              <span class="eyebrow">CATALOG STRUCTURE</span>
              <h2>Categories</h2>
            </div>
          </div>
          <div class="toolbar">
            <div class="search-control">
              <svg lucideSearch [size]="17"></svg
              ><input
                [(ngModel)]="categorySearch"
                (ngModelChange)="filterCategories()"
                placeholder="Search categories"
              />
            </div>
          </div>
          <div class="category-layout">
            <form
              class="category-form panel"
              [formGroup]="categoryForm"
              (ngSubmit)="saveCategory()"
            >
              <h3>{{ editingCategoryId() ? 'Edit category' : 'Create category' }}</h3>
              <label>Name<input formControlName="name" placeholder="Category name" /></label>
              <label
                >Slug<input formControlName="slug" placeholder="optional-auto-generated"
              /></label>
              <div class="form-actions">
                <button type="button" class="btn outline" (click)="resetCategory()">Cancel</button
                ><button class="btn primary" [disabled]="categoryForm.invalid">
                  {{ editingCategoryId() ? 'Save' : 'Create' }}
                </button>
              </div>
            </form>
            <div class="table-wrap panel">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Slug</th>
                    <th>Products</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (category of filteredCategories(); track category.id) {
                    <tr>
                      <td>
                        <strong>{{ category.name }}</strong>
                      </td>
                      <td>{{ category.slug }}</td>
                      <td>{{ category.productCount ?? 0 }}</td>
                      <td class="row-actions">
                        <button (click)="editCategory(category)" title="Edit">
                          <svg lucidePencil [size]="16"></svg></button
                        ><button class="danger" (click)="removeCategory(category)" title="Delete">
                          <svg lucideTrash [size]="16"></svg>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </main>
    </section>
  `,
})
export class AdminComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  auth = inject(AuthService);
  private productsService = inject(ProductService);
  private categoriesService = inject(CategoryService);
  private ordersService = inject(OrderService);
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  tabs: { id: AdminTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: 'Products' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'orders', label: 'Orders' },
    { id: 'categories', label: 'Categories' },
  ];
  tab = signal<AdminTab>('overview');
  dashboard = signal<AdminDashboard | null>(null);
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  filteredOrders = signal<Order[]>([]);
  filteredCategories = signal<Category[]>([]);
  filteredUsers = signal<AdminUser[]>([]);
  categories = signal<Category[]>([]);
  orders = signal<Order[]>([]);
  users = signal<AdminUser[]>([]);
  showProductForm = signal(false);
  editingId = signal<number | null>(null);
  editingCategoryId = signal<number | null>(null);
  productSearch = '';
  stockFilter = 'all';
  orderStatus = '';
  orderSearch = '';
  categorySearch = '';
  customerSearch = '';

  productForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    imageUrl: [''],
    categoryId: [0, Validators.required],
  });
  categoryForm = this.fb.nonNullable.group({ name: ['', Validators.required], slug: [''] });
  today = signal(new Date());

  constructor() {
    this.refresh();
  }
  activeTitle() {
    return this.tabs.find((item) => item.id === this.tab())?.label || 'Overview';
  }
  initials() {
    const name = this.auth.currentUser()?.fullName?.trim() || 'Admin';
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
  refresh() {
    this.adminService.getDashboard().subscribe({
      next: (value) => this.dashboard.set(value),
      error: () => this.toast.error('Could not load dashboard.'),
    });
    this.loadProducts();
    this.loadCategories();
    this.loadOrders();
    this.loadUsers();
  }
  lowStockProducts() {
    return this.products()
      .filter((p) => p.stockQuantity <= 5)
      .slice(0, 5);
  }
  loadProducts() {
    this.productsService.getProducts().subscribe({
      next: (value) => {
        this.products.set(value);
        this.filterProducts();
      },
      error: () => this.toast.error('Could not load products.'),
    });
  }
  loadCategories() {
    this.categoriesService.getCategories().subscribe({
      next: (value) => {
        this.categories.set(value);
        this.filterCategories();
      },
      error: () => this.toast.error('Could not load categories.'),
    });
  }
  loadOrders() {
    this.ordersService.getAllOrders(this.orderStatus || undefined).subscribe({
      next: (value) => {
        this.orders.set(value);
        this.filterOrders();
      },
      error: () => this.toast.error('Could not load orders.'),
    });
  }
  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (value) => {
        this.users.set(value);
        this.filterUsers();
      },
      error: () => this.toast.error('Could not load users.'),
    });
  }
  filterProducts() {
    const search = this.productSearch.toLowerCase();
    this.filteredProducts.set(
      this.products().filter(
        (p) =>
          (!search ||
            p.name.toLowerCase().includes(search) ||
            p.categoryName.toLowerCase().includes(search)) &&
          (this.stockFilter === 'all' ||
            (this.stockFilter === 'low' && p.stockQuantity > 0 && p.stockQuantity <= 5) ||
            (this.stockFilter === 'out' && p.stockQuantity === 0)),
      ),
    );
  }
  filterOrders() {
    const search = this.orderSearch.trim().toLowerCase();
    this.filteredOrders.set(
      this.orders().filter(
        (order) =>
          !search ||
          String(order.id).includes(search) ||
          (order.customerName || '').toLowerCase().includes(search) ||
          (order.customerEmail || '').toLowerCase().includes(search) ||
          order.status.toLowerCase().includes(search),
      ),
    );
  }
  filterCategories() {
    const search = this.categorySearch.trim().toLowerCase();
    this.filteredCategories.set(
      this.categories().filter(
        (category) =>
          !search ||
          category.name.toLowerCase().includes(search) ||
          category.slug.toLowerCase().includes(search),
      ),
    );
  }
  filterUsers() {
    const search = this.customerSearch.trim().toLowerCase();
    this.filteredUsers.set(
      this.users().filter(
        (user) =>
          !search ||
          user.fullName.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.role.toLowerCase().includes(search),
      ),
    );
  }
  edit(product: Product) {
    this.editingId.set(product.id);
    this.showProductForm.set(true);
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
    });
  }
  resetForm() {
    this.editingId.set(null);
    this.showProductForm.set(false);
    this.productForm.reset({
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      imageUrl: '',
      categoryId: this.categories()[0]?.id || 0,
    });
  }
  saveProduct() {
    if (this.productForm.invalid) return;
    const dto = this.productForm.getRawValue();
    const request = this.editingId()
      ? this.productsService.updateProduct(this.editingId()!, dto)
      : this.productsService.createProduct(dto);
    request.subscribe({
      next: () => {
        this.toast.success(this.editingId() ? 'Product updated.' : 'Product created.');
        this.resetForm();
        this.loadProducts();
        this.refresh();
      },
      error: (err) =>
        this.toast.error(typeof err.error === 'string' ? err.error : 'Could not save product.'),
    });
  }
  remove(id: number) {
    if (!confirm('Delete this product?')) return;
    this.productsService.deleteProduct(id).subscribe({
      next: () => {
        this.toast.success('Product deleted.');
        this.loadProducts();
        this.refresh();
      },
      error: () => this.toast.error('Could not delete product.'),
    });
  }
  changeStatus(id: number, status: string) {
    this.ordersService.updateOrderStatus(id, status).subscribe({
      next: (order) => {
        this.orders.update((items) => items.map((item) => (item.id === id ? order : item)));
        this.refresh();
        this.toast.success('Order status updated.');
      },
      error: () => this.toast.error('Could not update order.'),
    });
  }
  editCategory(category: Category) {
    this.editingCategoryId.set(category.id);
    this.categoryForm.patchValue({ name: category.name, slug: category.slug });
  }
  resetCategory() {
    this.editingCategoryId.set(null);
    this.categoryForm.reset({ name: '', slug: '' });
  }
  saveCategory() {
    if (this.categoryForm.invalid) return;
    const { name, slug } = this.categoryForm.getRawValue();
    const request = this.editingCategoryId()
      ? this.categoriesService.updateCategory(this.editingCategoryId()!, name, slug)
      : this.categoriesService.createCategory(name, slug);
    request.subscribe({
      next: () => {
        this.toast.success(this.editingCategoryId() ? 'Category updated.' : 'Category created.');
        this.resetCategory();
        this.loadCategories();
        this.refresh();
      },
      error: (err) =>
        this.toast.error(typeof err.error === 'string' ? err.error : 'Could not save category.'),
    });
  }
  removeCategory(category: Category) {
    if (!confirm(`Delete "${category.name}"?`)) return;
    this.categoriesService.deleteCategory(category.id).subscribe({
      next: () => {
        this.toast.success('Category deleted.');
        this.loadCategories();
        this.refresh();
      },
      error: (err) => this.toast.error(err.error?.message || 'Could not delete category.'),
    });
  }
  changeUserRole(user: AdminUser, role: 'Customer' | 'Admin') {
    this.adminService.updateUserRole(user.id, role).subscribe({
      next: () => {
        user.role = role;
        this.toast.success('User role updated.');
      },
      error: () => this.toast.error('Could not update role.'),
    });
  }
}
