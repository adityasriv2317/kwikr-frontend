import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/categories`;
  getCategories() { return this.http.get<Category[]>(this.url); }
  createCategory(name: string, slug: string) { return this.http.post<Category>(this.url, { name, slug }); }
  updateCategory(id: number, name: string, slug: string) { return this.http.put<Category>(`${this.url}/${id}`, { name, slug }); }
  deleteCategory(id: number) { return this.http.delete(`${this.url}/${id}`); }
}
