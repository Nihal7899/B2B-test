import { supabase } from '@/lib/supabase';
import type { Product, Category, PromoBanner, Order } from '@/types';

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

export interface DbProduct {
  id: string;
  category_id: string;
  brand: string;
  name: string;
  slug: string;
  pack_size: string;
  mrp: number;
  wholesale_price: number;
  moq: number;
  stock_quantity: number;
  image_url: string;
  description: string;
  rating: number;
  is_active: boolean;
}

export interface DbPromotion {
  id: string;
  headline: string;
  subtext: string;
  cta_label: string;
  image_url: string;
  background: string;
  badge: string;
  sort_order: number;
  is_active: boolean;
}

export interface DbOrder {
  id: string;
  order_number: string;
  user_id: string;
  address_id: string | null;
  status: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  notes: string;
  created_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  brand: string;
  product_name: string;
  pack_size: string;
  unit_price: number;
  mrp: number;
  quantity: number;
  line_total: number;
}

export interface DbAddress {
  id: string;
  user_id: string;
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
}

const categoryColors = [
  'bg-brand-50', 'bg-amber-50', 'bg-orange-50', 'bg-yellow-50', 'bg-rose-50',
  'bg-red-50', 'bg-sky-50', 'bg-blue-50', 'bg-teal-50', 'bg-emerald-50',
  'bg-indigo-50', 'bg-purple-50',
];

export function mapCategory(db: DbCategory, index: number, productCount?: number): Category {
  return {
    id: db.id,
    name: db.name,
    image: db.image_url,
    count: productCount ?? 0,
    color: categoryColors[index % categoryColors.length],
  };
}

export function mapProduct(db: DbProduct, categoryId: string): Product {
  return {
    id: db.id,
    brand: db.brand,
    name: db.name,
    packSize: db.pack_size,
    mrp: Number(db.mrp),
    price: Number(db.wholesale_price),
    image: db.image_url,
    category: categoryId,
    moq: db.moq,
    rating: Number(db.rating),
    description: db.description,
    inStock: db.stock_quantity > 0,
  };
}

export function mapPromotion(db: DbPromotion): PromoBanner {
  const bgMap: Record<string, string> = {
    brand: 'bg-gradient-to-br from-brand-700 to-brand-900',
    accent: 'bg-gradient-to-br from-accent-500 to-accent-700',
    ink: 'bg-gradient-to-br from-ink-800 to-ink-900',
  };
  return {
    id: db.id,
    headline: db.headline,
    subtext: db.subtext,
    cta: db.cta_label,
    image: db.image_url,
    bgClass: bgMap[db.background] ?? bgMap.brand,
    textClass: 'text-white',
    badge: db.badge,
  };
}

export function mapOrder(db: DbOrder, items: DbOrderItem[]): Order {
  const statusMap: Record<string, Order['status']> = {
    pending: 'Processing',
    confirmed: 'Processing',
    packed: 'Processing',
    ready_for_pickup: 'Processing',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return {
    id: db.id,
    orderNo: db.order_number,
    date: new Date(db.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    total: Number(db.total),
    status: statusMap[db.status] ?? 'Processing',
    items: items.map((i) => `${i.brand} ${i.product_name}`),
  };
}

export async function fetchCategories(): Promise<{ categories: Category[]; slugMap: Record<string, string> }> {
  const { data, error } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order');
  if (error) throw error;
  const slugMap: Record<string, string> = {};
  const categories = (data as DbCategory[]).map((c, i) => {
    slugMap[c.id] = c.slug;
    return mapCategory(c, i);
  });
  return { categories, slugMap };
}

export async function fetchProducts(): Promise<{ products: Product[]; categoryMap: Record<string, string> }> {
  const { data: catData } = await supabase.from('categories').select('id, slug').eq('is_active', true);
  const categoryMap: Record<string, string> = {};
  (catData as DbCategory[] | null)?.forEach((c) => { categoryMap[c.id] = c.slug; });

  const { data, error } = await supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false });
  if (error) throw error;
  const products = (data as DbProduct[]).map((p) => mapProduct(p, categoryMap[p.category_id] ?? ''));
  return { products, categoryMap };
}

export async function fetchPromotions(): Promise<PromoBanner[]> {
  const { data, error } = await supabase.from('promotions').select('*').eq('is_active', true).order('sort_order');
  if (error) throw error;
  return (data as DbPromotion[]).map(mapPromotion);
}

export async function fetchProductById(id: string): Promise<{ product: Product; related: Product[] } | null> {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  const dbProduct = data as DbProduct;

  const { data: catData } = await supabase.from('categories').select('id, slug').eq('id', dbProduct.category_id).maybeSingle();
  const categorySlug = (catData as DbCategory | null)?.slug ?? '';

  const product = mapProduct(dbProduct, categorySlug);

  const { data: relatedData } = await supabase
    .from('products').select('*').eq('category_id', dbProduct.category_id).eq('is_active', true).neq('id', id).limit(6);
  const related = (relatedData as DbProduct[] | null)?.map((p) => mapProduct(p, categorySlug)) ?? [];

  return { product, related };
}

export async function fetchWishlist(): Promise<string[]> {
  const { data, error } = await supabase.from('wishlists').select('product_id');
  if (error) return [];
  return (data as { product_id: string }[]).map((r) => r.product_id);
}

export async function toggleWishlist(productId: string, isWishlisted: boolean): Promise<void> {
  if (isWishlisted) {
    await supabase.from('wishlists').delete().eq('product_id', productId);
  } else {
    await supabase.from('wishlists').insert({ product_id: productId });
  }
}

export async function fetchAddresses(): Promise<DbAddress[]> {
  const { data, error } = await supabase.from('addresses').select('*').order('is_default', { ascending: false }).order('created_at', { ascending: false });
  if (error) return [];
  return data as DbAddress[];
}

export async function saveAddress(addr: Partial<DbAddress> & { recipient_name: string; phone: string; line1: string; city: string; state: string; postal_code: string }): Promise<DbAddress | null> {
  if (addr.is_default) {
    await supabase.from('addresses').update({ is_default: false }).eq('is_default', true);
  }
  const { data, error } = await supabase.from('addresses').insert({
    label: addr.label ?? 'Business',
    recipient_name: addr.recipient_name,
    phone: addr.phone,
    line1: addr.line1,
    line2: addr.line2 ?? '',
    city: addr.city,
    state: addr.state,
    postal_code: addr.postal_code,
    latitude: addr.latitude,
    longitude: addr.longitude,
    place_id: addr.place_id,
    is_default: addr.is_default ?? false,
  }).select().single();
  if (error) throw error;
  return data as DbAddress;
}

export async function deleteAddress(id: string): Promise<void> {
  await supabase.from('addresses').delete().eq('id', id);
}

export async function fetchOrders(): Promise<Order[]> {
  const { data: orderData, error: orderError } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (orderError || !orderData) return [];

  const orderIds = (orderData as DbOrder[]).map((o) => o.id);
  if (orderIds.length === 0) return [];

  const { data: itemData } = await supabase.from('order_items').select('*').in('order_id', orderIds);
  const itemsByOrder: Record<string, DbOrderItem[]> = {};
  (itemData as DbOrderItem[] | null)?.forEach((item) => {
    if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
    itemsByOrder[item.order_id].push(item);
  });

  return (orderData as DbOrder[]).map((o) => mapOrder(o, itemsByOrder[o.id] ?? []));
}

export async function fetchOrderDetail(orderId: string): Promise<{ order: DbOrder; items: DbOrderItem[]; address: DbAddress | null } | null> {
  const { data: order, error: oe } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
  if (oe || !order) return null;
  const { data: items } = await supabase.from('order_items').select('*').eq('order_id', orderId);
  let address: DbAddress | null = null;
  if ((order as DbOrder).address_id) {
    const { data: addr } = await supabase.from('addresses').select('*').eq('id', (order as DbOrder).address_id).maybeSingle();
    address = addr as DbAddress | null;
  }
  return { order: order as DbOrder, items: (items as DbOrderItem[]) ?? [], address };
}

export async function placeOrder(addressId: string, items: { product_id: string; quantity: number }[]): Promise<string | null> {
  const { data, error } = await supabase.rpc('create_order', {
    p_address_id: addressId,
    p_items: items,
  });
  if (error) throw error;
  return data as string;
}

export async function clearCartItems(cartId: string): Promise<void> {
  await supabase.from('cart_items').delete().eq('cart_id', cartId);
}

export async function fetchProfile() {
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle();
  if (error) return null;
  return data;
}

export async function updateProfile(updates: { full_name?: string; business_name?: string; avatar_url?: string }) {
  const { error } = await supabase.from('profiles').update(updates).eq('id', (await supabase.auth.getUser()).data.user?.id);
  if (error) throw error;
}
