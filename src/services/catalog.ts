// services/catalog.ts
import { supabase } from '@/lib/supabase';
import type {
  Product,
  Category,
  PromoBanner,
  Order,
  FilterConfig,
  HomeBanner,
  ActionType,
  Store,
  TrustedBrand,
} from '@/types';

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
  'bg-brand-50',
  'bg-amber-50',
  'bg-orange-50',
  'bg-yellow-50',
  'bg-rose-50',
  'bg-red-50',
  'bg-sky-50',
  'bg-blue-50',
  'bg-teal-50',
  'bg-emerald-50',
  'bg-indigo-50',
  'bg-purple-50',
];

const PLACEHOLDER_CATEGORY = 'https://placehold.co/600x400/EEE/999?text=Category';
const PLACEHOLDER_PRODUCT = 'https://placehold.co/400x400/EEE/999?text=Product';

export function mapCategory(db: DbCategory, index: number, productCount?: number): Category {
  return {
    id: db.slug, // use slug as ID for routing
    name: db.name,
    image: db.image_url?.trim() ? db.image_url : PLACEHOLDER_CATEGORY,
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
    image: db.image_url?.trim() ? db.image_url : PLACEHOLDER_PRODUCT,
    category: categoryId,
    moq: db.moq,
    rating: Number(db.rating),
    description: db.description,
    inStock: db.stock_quantity > 0,
  };
}

const bgMap: Record<string, string> = {
  brand: 'bg-gradient-to-br from-brand-700 to-brand-900',
  accent: 'bg-gradient-to-br from-accent-500 to-accent-700',
  ink: 'bg-gradient-to-br from-ink-800 to-ink-900',
};

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
    date: new Date(db.created_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    total: Number(db.total),
    status: statusMap[db.status] ?? 'Processing',
    items: items.map((i) => `${i.brand} ${i.product_name}`),
  };
}

// ----- FETCH CATEGORIES -----
export async function fetchCategories(): Promise<{ categories: Category[]; slugMap: Record<string, string> }> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  const slugMap: Record<string, string> = {};
  const categories = (data as DbCategory[]).map((c, i) => {
    slugMap[c.id] = c.slug;
    return mapCategory(c, i);
  });
  return { categories, slugMap };
}

// ----- FETCH PRODUCTS -----
export async function fetchProducts(): Promise<{ products: Product[]; categoryMap: Record<string, string> }> {
  const { data: catData } = await supabase
    .from('categories')
    .select('id, slug')
    .eq('is_active', true);
  const categoryMap: Record<string, string> = {};
  (catData as DbCategory[] | null)?.forEach((c) => {
    categoryMap[c.id] = c.slug;
  });

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const products = (data as DbProduct[]).map((p) =>
    mapProduct(p, categoryMap[p.category_id] ?? '')
  );
  return { products, categoryMap };
}

// ----- FETCH PRODUCT BY ID -----
export async function fetchProductById(id: string): Promise<{ product: Product; related: Product[] } | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  const dbProduct = data as DbProduct;

  const { data: catData } = await supabase
    .from('categories')
    .select('id, slug')
    .eq('id', dbProduct.category_id)
    .maybeSingle();
  const categorySlug = (catData as DbCategory | null)?.slug ?? '';

  const product = mapProduct(dbProduct, categorySlug);

  const { data: relatedData } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', dbProduct.category_id)
    .eq('is_active', true)
    .neq('id', id)
    .limit(6);
  const related = (relatedData as DbProduct[] | null)?.map((p) =>
    mapProduct(p, categorySlug)
  ) ?? [];

  return { product, related };
}

// ----- WISHLIST -----
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

// ----- ADDRESSES -----
export async function fetchAddresses(): Promise<DbAddress[]> {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) return [];
  return data as DbAddress[];
}

export async function deleteAddress(id: string): Promise<void> {
  await supabase.from('addresses').delete().eq('id', id);
}

// ----- ORDERS -----
export async function fetchOrders(): Promise<Order[]> {
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (orderError || !orderData) return [];

  const orderIds = (orderData as DbOrder[]).map((o) => o.id);
  if (orderIds.length === 0) return [];

  const { data: itemData } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds);
  const itemsByOrder: Record<string, DbOrderItem[]> = {};
  (itemData as DbOrderItem[] | null)?.forEach((item) => {
    if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
    itemsByOrder[item.order_id].push(item);
  });

  return (orderData as DbOrder[]).map((o) =>
    mapOrder(o, itemsByOrder[o.id] ?? [])
  );
}

export async function fetchOrderDetail(
  orderId: string
): Promise<{ order: DbOrder; items: DbOrderItem[]; address: DbAddress | null } | null> {
  const { data: order, error: oe } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();
  if (oe || !order) return null;
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);
  let address: DbAddress | null = null;
  if ((order as DbOrder).address_id) {
    const { data: addr } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', (order as DbOrder).address_id)
      .maybeSingle();
    address = addr as DbAddress | null;
  }
  return { order: order as DbOrder, items: (items as DbOrderItem[]) ?? [], address };
}

export async function placeOrder(
  addressId: string,
  items: { product_id: string; quantity: number }[]
): Promise<string | null> {
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

// ----- PROFILE -----
export async function fetchProfile() {
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle();
  if (error) return null;
  return data;
}

export async function updateProfile(updates: {
  full_name?: string;
  business_name?: string;
  avatar_url?: string;
  personal_name?: string;
  registration_status?: 'unregistered' | 'registered';
}) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', (await supabase.auth.getUser()).data.user?.id);
  if (error) throw error;
}

// ----- HOME BANNERS (Unified) -----
export interface DbHomeBanner {
  id: string;
  badge: string | null;
  title: string;
  description: string;
  image_url: string;
  background_color: string;
  button_text: string;
  action_type: string;
  action_config: Record<string, unknown>;
  display_order: number;
  is_active: boolean;
  position: string; // 'top' | 'carousel' | 'middle' | 'bottom'
  start_at: string | null;
  end_at: string | null;
  created_at: string;
  updated_at: string;
}

export function mapHomeBanner(db: DbHomeBanner): PromoBanner {
  return {
    id: db.id,
    headline: db.title,
    subtext: db.description,
    cta: db.button_text,
    image: db.image_url,
    bgClass: bgMap[db.background_color] ?? bgMap.brand,
    textClass: 'text-white',
    badge: db.badge ?? undefined,
    actionType: db.action_type,
    actionConfig: db.action_config,
    position: db.position || 'top',
  };
}

export async function fetchHomeBanners(): Promise<PromoBanner[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('home_banners')
    .select('*')
    .eq('is_active', true)
    .or(`start_at.is.null,start_at.lte.${now}`)
    .or(`end_at.is.null,end_at.gte.${now}`)
    .order('display_order');
  if (error || !data) return [];
  return (data as DbHomeBanner[]).map(mapHomeBanner);
}

export async function fetchAllHomeBanners(): Promise<HomeBanner[]> {
  const { data, error } = await supabase
    .from('home_banners')
    .select('*')
    .order('display_order');
  if (error || !data) return [];
  return data as HomeBanner[];
}

export async function createHomeBanner(
  input: Omit<HomeBanner, 'id' | 'created_at' | 'updated_at'>
): Promise<HomeBanner | null> {
  const { data, error } = await supabase
    .from('home_banners')
    .insert({
      badge: input.badge,
      title: input.title,
      description: input.description,
      image_url: input.image_url,
      background_color: input.background_color,
      button_text: input.button_text,
      action_type: input.action_type,
      action_config: input.action_config,
      display_order: input.display_order,
      is_active: input.is_active,
      position: input.position || 'top',
      start_at: input.start_at,
      end_at: input.end_at,
    })
    .select()
    .single();
  if (error) throw error;
  return data as HomeBanner;
}

export async function updateHomeBanner(id: string, updates: Partial<HomeBanner>): Promise<void> {
  const { error } = await supabase
    .from('home_banners')
    .update({
      badge: updates.badge,
      title: updates.title,
      description: updates.description,
      image_url: updates.image_url,
      background_color: updates.background_color,
      button_text: updates.button_text,
      action_type: updates.action_type,
      action_config: updates.action_config,
      display_order: updates.display_order,
      is_active: updates.is_active,
      position: updates.position || 'top',
      start_at: updates.start_at,
      end_at: updates.end_at,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteHomeBanner(id: string): Promise<void> {
  await supabase.from('home_banners').delete().eq('id', id);
}

export async function duplicateHomeBanner(id: string): Promise<HomeBanner | null> {
  const { data: original } = await supabase
    .from('home_banners')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (!original) return null;
  const orig = original as DbHomeBanner;
  const { data, error } = await supabase
    .from('home_banners')
    .insert({
      badge: orig.badge,
      title: orig.title + ' (Copy)',
      description: orig.description,
      image_url: orig.image_url,
      background_color: orig.background_color,
      button_text: orig.button_text,
      action_type: orig.action_type,
      action_config: orig.action_config,
      display_order: orig.display_order + 1,
      is_active: false,
      position: orig.position || 'top',
      start_at: null,
      end_at: null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as HomeBanner;
}

// ----- FILTERED PRODUCTS -----
export async function fetchFilteredProducts(filter: FilterConfig): Promise<Product[]> {
  const { data: catData } = await supabase
    .from('categories')
    .select('id, slug')
    .eq('is_active', true);
  const categoryMap: Record<string, string> = {};
  const slugToIdMap: Record<string, string> = {};
  (catData as DbCategory[] | null)?.forEach((c) => {
    categoryMap[c.id] = c.slug;
    slugToIdMap[c.slug] = c.id;
  });

  let query = supabase.from('products').select('*').eq('is_active', true);

  if (filter.category_ids && filter.category_ids.length > 0) {
    const catIds = filter.category_ids.map((id) => slugToIdMap[id] ?? id);
    query = query.in('category_id', catIds);
  }
  if (filter.brand_ids && filter.brand_ids.length > 0) {
    query = query.in('brand', filter.brand_ids);
  }
  if (filter.product_ids && filter.product_ids.length > 0) {
    query = query.in('id', filter.product_ids);
  }
  if (filter.stock_only) {
    query = query.gt('stock_quantity', 0);
  }
  if (typeof filter.price_min === 'number') {
    query = query.gte('wholesale_price', filter.price_min);
  }
  if (typeof filter.price_max === 'number') {
    query = query.lte('wholesale_price', filter.price_max);
  }

  const sortMap: Record<string, string> = {
    discount_desc: 'created_at',
    discount_asc: 'created_at',
    price_asc: 'wholesale_price',
    price_desc: 'wholesale_price',
    rating_desc: 'rating',
    newest: 'created_at',
  };
  const ascending = filter.sort === 'price_asc' || filter.sort === 'rating_desc';
  query = query.order(sortMap[filter.sort ?? 'newest'] ?? 'created_at', { ascending });

  const { data, error } = await query.limit(100);
  if (error) throw error;

  let products = (data as DbProduct[]).map((p) =>
    mapProduct(p, categoryMap[p.category_id] ?? '')
  );

  if (typeof filter.discount_min === 'number' || typeof filter.discount_max === 'number') {
    products = products.filter((p) => {
      const discount = p.mrp > 0 ? ((p.mrp - p.price) / p.mrp) * 100 : 0;
      if (typeof filter.discount_min === 'number' && discount < filter.discount_min)
        return false;
      if (typeof filter.discount_max === 'number' && discount > filter.discount_max)
        return false;
      return true;
    });
  }

  if (filter.sort === 'discount_desc') {
    products.sort((a, b) => {
      const da = a.mrp > 0 ? ((a.mrp - a.price) / a.mrp) * 100 : 0;
      const db = b.mrp > 0 ? ((b.mrp - b.price) / b.mrp) * 100 : 0;
      return db - da;
    });
  } else if (filter.sort === 'discount_asc') {
    products.sort((a, b) => {
      const da = a.mrp > 0 ? ((a.mrp - a.price) / a.mrp) * 100 : 0;
      const db = b.mrp > 0 ? ((b.mrp - b.price) / b.mrp) * 100 : 0;
      return da - db;
    });
  }

  return products;
}

export async function fetchAllBrands(): Promise<string[]> {
  const { data, error } = await supabase
    .from('products')
    .select('brand')
    .eq('is_active', true);
  if (error || !data) return [];
  const brands = new Set((data as { brand: string }[]).map((r) => r.brand));
  return Array.from(brands).sort();
}

// ----- STORES CRUD -----
export async function fetchStores(): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) return [];
  return data as Store[];
}

export async function fetchAllStores(): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('sort_order');
  if (error) return [];
  return data as Store[];
}

export async function createStore(
  input: Omit<Store, 'id' | 'created_at' | 'updated_at'>
): Promise<Store | null> {
  const { data, error } = await supabase
    .from('stores')
    .insert({
      name: input.name,
      image_url: input.image_url,
      description: input.description,
      theme_bg: input.theme_bg,
      theme_border: input.theme_border,
      theme_text: input.theme_text,
      theme_accent: input.theme_accent,
      product_ids: input.product_ids,
      sort_order: input.sort_order,
      is_active: input.is_active,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Store;
}

export async function updateStore(id: string, updates: Partial<Store>): Promise<void> {
  const { error } = await supabase
    .from('stores')
    .update({
      name: updates.name,
      image_url: updates.image_url,
      description: updates.description,
      theme_bg: updates.theme_bg,
      theme_border: updates.theme_border,
      theme_text: updates.theme_text,
      theme_accent: updates.theme_accent,
      product_ids: updates.product_ids,
      sort_order: updates.sort_order,
      is_active: updates.is_active,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteStore(id: string): Promise<void> {
  await supabase.from('stores').delete().eq('id', id);
}

// ----- TRUSTED BRANDS CRUD -----
export async function fetchTrustedBrands(): Promise<TrustedBrand[]> {
  const { data, error } = await supabase
    .from('trusted_brands')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) return [];
  return data as TrustedBrand[];
}

export async function fetchAllTrustedBrands(): Promise<TrustedBrand[]> {
  const { data, error } = await supabase
    .from('trusted_brands')
    .select('*')
    .order('sort_order');
  if (error) return [];
  return data as TrustedBrand[];
}

export async function createTrustedBrand(
  input: Omit<TrustedBrand, 'id' | 'created_at' | 'updated_at'>
): Promise<TrustedBrand | null> {
  const { data, error } = await supabase
    .from('trusted_brands')
    .insert({
      name: input.name,
      logo_url: input.logo_url,
      sort_order: input.sort_order,
      is_active: input.is_active,
    })
    .select()
    .single();
  if (error) throw error;
  return data as TrustedBrand;
}

export async function updateTrustedBrand(id: string, updates: Partial<TrustedBrand>): Promise<void> {
  const { error } = await supabase
    .from('trusted_brands')
    .update({
      name: updates.name,
      logo_url: updates.logo_url,
      sort_order: updates.sort_order,
      is_active: updates.is_active,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteTrustedBrand(id: string): Promise<void> {
  await supabase.from('trusted_brands').delete().eq('id', id);
}

export type { ActionType };

// ----- SMART COLLECTIONS CRUD -----
export async function fetchSmartCollections(): Promise<SmartCollection[]> {
  const { data, error } = await supabase
    .from('smart_collections')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as SmartCollection[];
}

export async function fetchAllSmartCollections(): Promise<SmartCollection[]> {
  const { data, error } = await supabase
    .from('smart_collections')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as SmartCollection[];
}

// services/catalog.ts – add this function if not present
export async function fetchSmartCollectionById(id: string): Promise<SmartCollection | null> {
  const { data, error } = await supabase
    .from('smart_collections')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as SmartCollection | null;
}

export async function createSmartCollection(
  input: Omit<SmartCollection, 'id' | 'created_at' | 'updated_at'>
): Promise<SmartCollection | null> {
  const { data, error } = await supabase
    .from('smart_collections')
    .insert({
      name: input.name,
      description: input.description,
      filter_config: input.filter_config,
      is_active: input.is_active,
    })
    .select()
    .single();
  if (error) throw error;
  return data as SmartCollection;
}

export async function updateSmartCollection(
  id: string,
  updates: Partial<SmartCollection>
): Promise<void> {
  const { error } = await supabase
    .from('smart_collections')
    .update({
      name: updates.name,
      description: updates.description,
      filter_config: updates.filter_config,
      is_active: updates.is_active,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteSmartCollection(id: string): Promise<void> {
  await supabase.from('smart_collections').delete().eq('id', id);
}