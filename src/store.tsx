import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Product, CartItem } from './types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/auth';

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getQuantity: (productId: string) => number;
  clearCart: () => void;
  subtotal: number;
  totalMrp: number;
  discount: number;
  totalItems: number;
  loading: boolean;
  cartId: string | null;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartId, setCartId] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return; }
    setLoading(true);
    try {
      const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).maybeSingle();
      if (!cart) { setItems([]); setLoading(false); return; }
      setCartId(cart.id);

      const { data: cartItems } = await supabase
        .from('cart_items')
        .select('product_id, quantity, products!inner(id, brand, name, pack_size, mrp, wholesale_price, image_url, moq, rating, description, stock_quantity, is_active, category_id)')
        .eq('cart_id', cart.id);

      if (cartItems) {
        const { data: catData } = await supabase.from('categories').select('id, slug');
        const catMap: Record<string, string> = {};
        (catData as { id: string; slug: string }[] | null)?.forEach((c) => { catMap[c.id] = c.slug; });

        const mapped: CartItem[] = cartItems.map((row: Record<string, unknown>) => {
          const p = row.products as Record<string, unknown>;
          return {
            quantity: row.quantity as number,
            product: {
              id: p.id as string,
              brand: p.brand as string,
              name: p.name as string,
              packSize: p.pack_size as string,
              mrp: Number(p.mrp),
              price: Number(p.wholesale_price),
              image: p.image_url as string,
              category: catMap[p.category_id as string] ?? '',
              moq: p.moq as number,
              rating: Number(p.rating),
              description: p.description as string,
              inStock: (p.stock_quantity as number) > 0,
            },
          };
        });
        setItems(mapped);
      }
    } catch (err) {
      console.error('Failed to load cart', err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { void loadCart(); }, [loadCart]);

  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    if (!cartId) return;
    const existing = items.find((i) => i.product.id === product.id);
    const newQty = (existing?.quantity ?? 0) + quantity;
    setItems((prev) => {
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: newQty } : i);
      return [...prev, { product, quantity }];
    });
    if (existing) {
      await supabase.from('cart_items').update({ quantity: newQty }).eq('cart_id', cartId).eq('product_id', product.id);
    } else {
      await supabase.from('cart_items').insert({ cart_id: cartId, product_id: product.id, quantity });
    }
  }, [cartId, items]);

  const removeFromCart = useCallback(async (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
    if (cartId) await supabase.from('cart_items').delete().eq('cart_id', cartId).eq('product_id', productId);
  }, [cartId]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) { void removeFromCart(productId); return; }
    setItems((prev) => prev.map((i) => i.product.id === productId ? { ...i, quantity } : i));
    if (cartId) await supabase.from('cart_items').update({ quantity }).eq('cart_id', cartId).eq('product_id', productId);
  }, [cartId, removeFromCart]);

  const getQuantity = useCallback((productId: string) => items.find((i) => i.product.id === productId)?.quantity ?? 0, [items]);

  const clearCart = useCallback(async () => {
    setItems([]);
    if (cartId) await supabase.from('cart_items').delete().eq('cart_id', cartId);
  }, [cartId]);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const totalMrp = items.reduce((sum, i) => sum + i.product.mrp * i.quantity, 0);
  const discount = totalMrp - subtotal;
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, getQuantity, clearCart, subtotal, totalMrp, discount, totalItems, loading, cartId }}>
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
