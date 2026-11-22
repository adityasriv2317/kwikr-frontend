import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CheckoutDto, Order } from '../models/order.model';
@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/orders`;
  checkout(dto: CheckoutDto) { return this.http.post<Order>(`${this.url}/checkout`, dto); }
  getMyOrders() { return this.http.get<Order[]>(`${this.url}/my-orders`); }
  getOrderById(id: number) { return this.http.get<Order>(`${this.url}/${id}`); }
  getAllOrders(status?: string) {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Order[]>(this.url, { params });
  }
  updateOrderStatus(id: number, status: string) {
    return this.http.patch<Order>(`${this.url}/${id}/status`, { status });
  }
}
