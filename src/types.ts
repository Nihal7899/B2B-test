// types.ts
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
  actionType?: string;
  actionConfig?: Record<string, unknown>;
  position?: string; // 'top' | 'carousel' | 'middle' | 'bottom'
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

export type ScreenName =
  | 'home'
  | 'categories'
  | 'orders'
  | 'cart'
  | 'account'
  | 'product'
  | 'admin'
  | 'warehouse'
  | 'delivery'
  | 'addresses'
  | 'wishlist'
  | 'checkout'
  | 'orderDetail'
  | 'businessRegistration'
  | 'businessSelect'
  | 'outletSelect'
  | 'filteredProducts';

export interface Business {
  id: string;
  owner_user_id: string;
  business_name: string;
  business_type: string;
  gst_registered: boolean;
  gstin: string | null;
  gst_verification_status: 'pending' | 'verified' | 'failed';
  gst_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessOutlet {
  id: string;
  business_id: string;
  outlet_name: string;
  outlet_type: string | null;
  phone: string | null;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryAddress {
  id: string;
  user_id: string;
  business_id: string | null;
  label: string;
  recipient_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  place_id: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type ActionType =
  | 'VIEW_CATEGORY'
  | 'VIEW_PRODUCT'
  | 'VIEW_BRAND'
  | 'VIEW_OFFER'
  | 'SEARCH'
  | 'FILTER_PRODUCTS'
  | 'OPEN_SMART_COLLECTION'
  | 'OPEN_CART'
  | 'OPEN_ORDERS'
  | 'OPEN_WISHLIST'
  | 'OPEN_ADDRESS'
  | 'OPEN_SCREEN'
  | 'OPEN_EXTERNAL_URL';

export interface FilterConfig {
  category_ids?: string[];
  brand_ids?: string[];
  product_ids?: string[];
  discount_min?: number | null;
  discount_max?: number | null;
  price_min?: number | null;
  price_max?: number | null;
  stock_only?: boolean;
  min_quantity?: number | null;
  availability?: 'available' | 'all';
  sort?: 'discount_desc' | 'discount_asc' | 'price_asc' | 'price_desc' | 'rating_desc' | 'newest';
}

export interface HomeBanner {
  id: string;
  badge: string | null;
  title: string;
  description: string;
  image_url: string;
  background_color: string;
  button_text: string;
  action_type: ActionType;
  action_config: Record<string, unknown>;
  display_order: number;
  is_active: boolean;
  position: string; // 'top' | 'carousel' | 'middle' | 'bottom'
  start_at: string | null;
  end_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SmartCollection {
  id: string;
  name: string;
  description: string;
  filter_config: FilterConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  name: string;
  image_url: string;
  description: string;
  theme_bg: string;
  theme_border: string;
  theme_text: string;
  theme_accent: string;
  product_ids: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrustedBrand {
  id: string;
  name: string;
  logo_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}