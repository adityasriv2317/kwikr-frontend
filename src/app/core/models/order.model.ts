import { CartItem } from './cart.model';
export interface OrderItem {
  productId: number;
  productName: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
}
export interface Order {
  id: number;
  totalAmount: number;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: string;
  createdAt: string;
  items: OrderItem[];
  customerName?: string;
  customerEmail?: string;
}
export interface CheckoutDto {
  fullName: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
}
