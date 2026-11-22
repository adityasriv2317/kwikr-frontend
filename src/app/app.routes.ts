import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { customerGuard } from './core/guards/customer.guard';

export const routes: Routes = [
  { path: '', canActivate: [customerGuard], loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'products/:id', canActivate: [customerGuard], loadComponent: () => import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'login', canActivate: [customerGuard], loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', canActivate: [customerGuard], loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
  { path: 'cart', canActivate: [customerGuard, authGuard], loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent) },
  { path: 'checkout', canActivate: [customerGuard, authGuard], loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'orders', canActivate: [customerGuard, authGuard], loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent) },
  { path: 'account', canActivate: [customerGuard, authGuard], loadComponent: () => import('./features/account/account.component').then(m => m.AccountComponent) },
  { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent) },
  { path: '**', redirectTo: '' }
];
