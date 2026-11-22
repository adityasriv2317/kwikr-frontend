import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface AdminDashboard {
  productCount: number;
  orderCount: number;
  customerCount: number;
  categoryCount: number;
  totalRevenue: number;
  lowStockCount: number;
  pendingOrderCount: number;
}

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  role: 'Customer' | 'Admin';
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/admin`;

  getDashboard() {
    return this.http.get<AdminDashboard>(`${this.url}/dashboard`);
  }

  getUsers() {
    return this.http.get<AdminUser[]>(`${this.url}/users`);
  }

  updateUserRole(id: number, role: 'Customer' | 'Admin') {
    return this.http.patch<void>(`${this.url}/users/${id}/role`, { role });
  }
}
