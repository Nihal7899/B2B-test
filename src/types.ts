export interface Product {
  id: string;
  brand: string;
  name: string;
  packSize: string;
  mrp: number;
  price: number;
  image: string;
  category: string;
  moq: number;
  rating: number;
  description: string;
  inStock: boolean;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  count: number;
  color: string;
}

export interface PromoBanner {
  id: string;
  headline: string;
  subtext: string;
  cta: string;
  image: string;
  bgClass: string;
  textClass: string;
  badge?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  orderNo: string;
  date: string;
  itemCount: number;
  total: number;
  status: 'Delivered' | 'Processing' | 'Out for Delivery' | 'Cancelled';
  items: string[];
}

export type ScreenName = 'home' | 'categories' | 'orders' | 'cart' | 'account' | 'product' | 'admin' | 'warehouse' | 'delivery' | 'addresses' | 'wishlist' | 'checkout' | 'orderDetail';
