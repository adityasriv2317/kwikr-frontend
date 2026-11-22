import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';
import { AccentLoaderComponent } from '../../shared/components/accent-loader.component';

@Component({
  standalone: true,
  styleUrl: './orders.component.css',
  imports: [CurrencyPipe, DatePipe, AccentLoaderComponent],
  template: `
    <section class="page-heading"><div><span class="eyebrow">PURCHASES</span><h1>My Orders</h1></div></section>
    @if (loading()) { <div class="loading-page"><app-accent-loader label="Loading orders..." /></div> }
    @else if (orders().length === 0) { <div class="empty-state"><h2>No orders yet</h2><p>Your purchases will appear here.</p></div> }
    @else { @for (order of orders(); track order.id) {
      <article class="order-card">
        <header><div><span>Order #{{ order.id }}</span><small>{{ order.createdAt | date:'mediumDate' }}</small></div>
          <span class="status {{ order.status.toLowerCase() }}">{{ order.status }}</span><strong>{{ order.totalAmount | currency:'INR':'symbol':'1.0-2' }}</strong></header>
        <div class="order-items">@for (item of order.items; track item.productId) { <div><span>{{ item.productName }} × {{ item.quantity }}</span><span>{{ item.unitPrice * item.quantity | currency:'INR':'symbol':'1.0-2' }}</span></div> }</div>
        <p class="shipping-address">Ship to: {{ order.shippingAddress }}</p>
      </article>
    } }
  `
})
export class OrdersComponent {
  private ordersService = inject(OrderService);
  orders = signal<Order[]>([]); loading = signal(true);
  constructor() {
    this.ordersService.getMyOrders().subscribe({ next: orders => { this.orders.set(orders); this.loading.set(false); }, error: () => this.loading.set(false) });
  }
}
