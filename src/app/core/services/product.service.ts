import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateProductDto, Product } from '../models/product.model';
@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/products`;
  getProducts(options: { search?: string; categoryId?: number; sort?: string } = {}) {
    let params = new HttpParams();
    if (options.search) params = params.set('search', options.search);
    if (options.categoryId) params = params.set('categoryId', options.categoryId);
    return this.http.get<Product[]>(this.url, { params });
  }
  getProductById(id: number) { return this.http.get<Product>(`${this.url}/${id}`); }
  createProduct(dto: CreateProductDto) { return this.http.post<Product>(this.url, dto); }
  updateProduct(id: number, dto: CreateProductDto) { return this.http.put<Product>(`${this.url}/${id}`, dto); }
  deleteProduct(id: number) { return this.http.delete(`${this.url}/${id}`); }
}
