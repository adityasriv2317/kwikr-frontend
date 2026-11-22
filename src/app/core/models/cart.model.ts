export interface CartItem {
  productId: number;
  name: string;
  imageUrl: string;
  price: number;
  stockQuantity: number;
  quantity: number;
}
export interface Cart {
  items: CartItem[];
  subtotal: number;
}
